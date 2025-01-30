import { QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CoBuyingSummary } from '@interface/cobuying';
import { CoBuyingPageingRes, PageingQuery } from '@interface/cobuyingList';
import { mapToCoBuyingEvaluatedKey, mapToCoBuyingSummary } from 'mappers/mapCoBuyingList';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';

const ddbDocClient = createDynamoDBDocClient();

export const queryCoBuyingListDAO = async (query: PageingQuery): Promise<CoBuyingPageingRes> => {
    try {
        const command = new QueryCommand(query);
        const coBuyingList: CoBuyingSummary[] = [];
        let response;
        let lastEvaluatedKey;
        while (coBuyingList.length < query.Limit) {
            response = await ddbDocClient.send(command);
            // console.log('items : ', response.Items);
            console.log('lastEvaluatedKey : ', response.LastEvaluatedKey);

            if (response.LastEvaluatedKey) {
                lastEvaluatedKey = response.LastEvaluatedKey;
                query.ExclusiveStartKey = lastEvaluatedKey;
            }

            if (response.Items && response.Count && coBuyingList.length + response.Count >= query.Limit) {
                // 이번 조회로 더 이상 조회할 필요가 없어진 경우
                // query.Limit 크기까지 coBuyingList에 item을 채워넣기.
                // 현재 조회된 Items에서 부족한 개수만큼 추가
                const remainingSpace = query.Limit - coBuyingList.length;
                const itemsToAdd = response.Items.slice(0, remainingSpace); // 부족한 개수만큼 추출
                coBuyingList.push(...mapToCoBuyingSummary(itemsToAdd)); // 매핑 후 리스트에 추가
                console.log('필요한 만큼 조회했습니다.');
                break;
            } else if (response.LastEvaluatedKey && response.Items) {
                // list에 item을 다 넣기
                coBuyingList.push(...mapToCoBuyingSummary(response.Items)); // 매핑 후 리스트에 추가
                console.log(`아직 부족해서 다음 조회하겠습니다. 현재 ${coBuyingList.length}개 조회`);
            } else {
                // 다음 조회가 없는 경우,
                coBuyingList.push(...mapToCoBuyingSummary(response.Items)); // 매핑 후 리스트에 추가
                console.log(`더 이상 조회할 아이템이 없습니다! 현재 ${coBuyingList.length}개 조회`);
                break;
            }
        }

        const res: CoBuyingPageingRes = {
            coBuyingList: coBuyingList,
            count: coBuyingList.length,
        };
        if (lastEvaluatedKey) {
            lastEvaluatedKey = mapToCoBuyingEvaluatedKey(lastEvaluatedKey);
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
