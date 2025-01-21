import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { CoBuyingSimple } from '@interface/cobuying';
import { CoBuyingPageingRes, PageingQuery } from '@interface/cobuyingList';
import { mapToCoBuyingEvaluatedKey, mapToCoBuyingSimple } from 'common/mapCoBuyingList';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';

const ddbDocClient = createDynamoDBDocClient();

export const queryCoBuyingListDAO = async (query: PageingQuery): Promise<CoBuyingPageingRes> => {
    try {
        // const query: any = {
        //     TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        //     IndexName: '',
        //     Limit: input.size || 20,
        //     FilterExpression: '',
        //     ExpressionAttributeValues: {},
        //     ExclusiveStartKey: {},
        //     ScanIndexForward: true,
        // }; 추후에 GetCommand로 최적화 하기
        const command = new ScanCommand(query);
        const response = await ddbDocClient.send(command);
        console.log('res : ', response);
        const coBuyingList: CoBuyingSimple[] = mapToCoBuyingSimple(response.Items);

        const res: CoBuyingPageingRes = {
            coBuyingList: coBuyingList,
            count: response.Count ? response.Count : 0,
        };
        if (response.LastEvaluatedKey) {
            const lastEvaluatedKey = mapToCoBuyingEvaluatedKey(response.LastEvaluatedKey);
            res['lastEvaluatedKey'] = lastEvaluatedKey;
        }
        return res;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw new Error(error.message);
        }
        throw new Error('DB 조회 중 문제가 발생했습니다. ');
    }
};
