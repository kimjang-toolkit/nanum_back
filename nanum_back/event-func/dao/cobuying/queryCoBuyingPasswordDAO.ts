import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { CoBuyingSimple } from '@interface/cobuying';
import { mapToCoBuyingSimple } from 'common/mapCoBuyingList';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';

const ddbDocClient = createDynamoDBDocClient();

export const queryCoBuyingPasswordById = async (ownerName: string, id: string): Promise<string> => {
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
    };

    try {
        // DynamoDB에서 해당 id에 해당하는 공구글을 조회
        // 단건 조회를 위한 GetCommand 실행
        const command = new QueryCommand(params);
        const result = await ddbDocClient.send(command);

        // 조회된 공구글 사용
        // console.log('조회된 공구글:', cobuying);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw new Error(error.message);
        }
        throw new Error('DB 조회 중 문제가 발생했습니다. ');
    }
};
