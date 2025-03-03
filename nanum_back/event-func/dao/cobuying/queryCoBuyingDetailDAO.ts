import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { CoBuyingDetail } from '@interface/cobuying';
import { mapToCoBuyingDetail } from 'mappers/mapCoBuyingDetail';
import { createDynamoDBDocClient } from 'dao/connect/createDDbDocClient';
import { APIERROR } from '@common/responseType';

const ddbDocClient = createDynamoDBDocClient();

export const queryCoBuyingDetail = async (ownerName: string, id: string): Promise<CoBuyingDetail> => {
    // DynamoDB에서 'id'로 공구글 조회
    // 단건 조회를 위한 파라미터 설정
    // 불변값으로 조희
    // console.log('ownerName : ', ownerName);
    // console.log('createdAt : ', createdAtId);
    // console.log(createdAtId === '2025-01-07#3e3ad1dd-3ef0-4a50-8e77-d3344bc4da98');

    const params = {
        TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        KeyConditionExpression: 'ownerName = :ownerName AND id = :id', // 쿼리 조건
        ExpressionAttributeValues: {
            ':ownerName': { S: ownerName }, // GSI 파티션 키 값
            ':id': { S: id }, // GSI 정렬 키 값
        },
    };

    try {
        // DynamoDB에서 해당 id에 해당하는 공구글을 조회
        // 단건 조회를 위한 GetCommand 실행
        const command = new QueryCommand(params);
        const result = await ddbDocClient.send(command);
        console.log(result);
        // 조회 결과가 없다면, 공구글을 찾을 수 없다는 에러를 던짐
        if (result.Items && result.Items.length > 0) {
            const cobuying: CoBuyingDetail = mapToCoBuyingDetail(result.Items[0]);
            // CoBuyingDetail 인터페이스에 맞게 데이터를 매핑하여 반환
            return cobuying;
            // 필요한 추가 로직
        } else {
            throw new APIERROR(404, '찾으시는 공구글이 존재하지 않아요. name : '+ownerName+' id : '+id);
        }
        // 조회된 공구글 사용
        // console.log('조회된 공구글:', cobuying);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw new APIERROR(500, 'DB 조회 중 문제가 발생했습니다. '+error.message);
        }
        throw new APIERROR(500, 'DB 조회 중 문제가 발생했습니다. ');
    }
};
