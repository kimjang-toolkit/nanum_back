import { PageingQueryDtoBuilder, CoBuyingPageingRes, CreatedAtIdKey } from '@cobuying/dto';
import { CoBuyingDynamoDBAdapter } from '@cobuying/outbound/dao';
import { CoBuyingSummary } from '@interface/cobuying';
import { CoBuyingQueryParams } from '@interface/cobuyingList';

// export const queryCoBuyingListSRV = async (input: CoBuyingQueryParams): Promise<CoBuyingPageingRes> => {
//     const query: PageingQuery = {
//         TableName: `${process.env.DEPLOYSTAGE}-${process.env.CoBuyingTableName}` || 'Dev-CoBuyingTable', // 테이블 이름
//         Limit: input.size || 20, // 최대 개수 (기본값 20)
//         IndexName: 'PagenationIndex',
//         KeyConditionExpression: 'deletedYN = :deletedYN',
//         ExpressionAttributeValues: {
//             ':deletedYN': { S: 'N' },
//         },
//         // CoBuyingSimple을 출력하게 기본 속성 정의. 정렬이나 필터링할 때 기준 속성 추가
//         ScanIndexForward: false,
//         // ProjectionExpression: CoBuyingSummaryProjectionExpression,
//     };

//     settingPageingQuery(input, query);
//     // 정렬기준에 따라 호출하는 쿼리가 달라짐
//     console.log('query : ', query);
//     // 생성일자 기준
//     const response: CoBuyingPageingRes = await queryCoBuyingListDAO(query);
//     return response;
//     // return response;
// };

/**
 * 공구글 목록 조회
 * 1. 페이지네이션 쿼리 생성
 * 2. 조회 목표 개수 확인
 * 3. 데이터 조회
 * 4. 목표 개수만큼 조회하지 못하면 추가 조회
 * 5. 2~4 과정을 반복하여 목표 개수만큼 조회
 * 6. 조회된 데이터 반환
 * 
 * @param input 
 * @returns 
 */
export const queryCoBuyingListSRV = async (input: CoBuyingQueryParams): Promise<CoBuyingPageingRes> => {
    const targetSize = input.size || 20;
    const repository = new CoBuyingDynamoDBAdapter();
    let allItems: CoBuyingSummary[] = []; // 조회된 데이터 저장
    let lastEvaluatedKey: CreatedAtIdKey | undefined; // 이전 조회의 마지막 키
    let hasMore = true; // 더 조회할 데이터가 있는지 여부
    const tableName = process.env.DEPLOYSTAGE + '-' + process.env.CoBuyingTableName;

    // 목표 개수만큼 조회하지 못하면 추가 조회
    while (hasMore && allItems.length < targetSize) {
        // 1. 페이지네이션 쿼리 생성
        const query = new PageingQueryDtoBuilder()
            .setTableName(tableName)
            .setLimit(targetSize - allItems.length) // 남은 개수만큼만 조회
            .setKeyConditionExpression('deletedYN = :deletedYN')
            .setExpressionAttributeValues({
                ':deletedYN': { S: 'N' },
            });

        // 이전 조회의 마지막 키가 있다면 추가
        if (lastEvaluatedKey) {
            query.setExclusiveStartKey(lastEvaluatedKey);
        }

        // 2. 데이터 조회
        const response = await repository.queryCoBuyingList(query.build());
        
        // 3. 결과 처리
        if (response.coBuyingList && response.coBuyingList.length > 0) {
            allItems = [...allItems, ...response.coBuyingList];
        }

        // 4. 다음 페이지 확인
        lastEvaluatedKey = response.lastEvaluatedKey;
        if (lastEvaluatedKey) {
            hasMore = true; // 다음 페이지가 있음
        } else {
            hasMore = false; // 다음 페이지가 없음
        }
    }

    return {
        coBuyingList: allItems,
        lastEvaluatedKey: lastEvaluatedKey,
        count: allItems.length
    } as CoBuyingPageingRes;
}
