import { PageingQuery } from '@api-interface/cobuying';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';

const ddbDocClient = createDynamoDBDocClient();

export const queryCoBuyingListDAO = async (query: PageingQuery): Promise<void> => {
    try {
        // const query: any = {
        //     TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        //     IndexName: '',
        //     Limit: input.size || 20,
        //     FilterExpression: '',
        //     ExpressionAttributeValues: {},
        //     ExclusiveStartKey: {},
        //     ScanIndexForward: true,
        // };
        const command = new QueryCommand(query);
        const response = await ddbDocClient.send(command);
        console.log('res : ', response);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw new Error(error.message);
        }
        throw new Error('DB 조회 중 문제가 발생했습니다. ');
    }
};
