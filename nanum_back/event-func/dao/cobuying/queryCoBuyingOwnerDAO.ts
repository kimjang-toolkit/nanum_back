import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { CoBuyingOwnerAuth } from '@interface/auth';
import { APIERROR } from 'common/responseType';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';
import { mapToCoBuyingOwnerAuth } from 'mappers/mapOwnerAuth';
const ddbDocClient = createDynamoDBDocClient();

export const queryCoBuyingOwnerById = async (ownerName: string, id: string): Promise<CoBuyingOwnerAuth> => {

    // DynamoDB에서 'id'로 공구글 조회
    // 단건 조회를 위한 파라미터 설정
    // 불변값으로 조희
    // console.log('ownerName : ', ownerName);
    // console.log('createdAt : ', createdAtId);
    // console.log(createdAtId === '2025-01-07#3e3ad1dd-3ef0-4a50-8e77-d3344bc4da98');

    const params = {
        TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        IndexName: 'OwnerNameGSI', // 사용할 GSI
        KeyConditionExpression: 'ownerName = :ownerName AND id = :id', // 쿼리 조건
        ExpressionAttributeValues: {
            ':ownerName': { S: ownerName }, // GSI 파티션 키 값
            ':id': { S: id }, // GSI 정렬 키 값
        },
        ProjectionExpression:'id, ownerName, ownerPassword'
    };
    let result;
    try {
        // DynamoDB에서 해당 id에 해당하는 공구글을 조회
        // 단건 조회를 위한 GetCommand 실행
        const command = new QueryCommand(params);
        result = await ddbDocClient.send(command);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw new Error(error.message);
        }
        throw new Error('DB 조회 중 문제가 발생했습니다. ');
    }

    if(result.Items && result.Items.length > 0){
        const owner = mapToCoBuyingOwnerAuth(result.Items[0]);
        return owner;
    }else{
        throw new APIERROR(404, '조회된 공구글이 없습니다.');
    }
};
