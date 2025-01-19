import { CoBuyingQueryParams, PageingQuery } from '@api-interface/cobuying';
import { queryCoBuyingListDAO } from '@cobuying/queryCoBuyingListDAO';
import { settingPageingQuery } from '@cobuying/settingPageingQuery';

export const queryCoBuyingListSRV = async (input: CoBuyingQueryParams): Promise<void> => {
    const query: PageingQuery = {
        TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        Limit: input.size || 20, // 최대 개수 (기본값 20)
        FilterExpression: '', // 필터 표현식
        ExpressionAttributeValues: {}, // 필터 표현식에 사용할 값들
        ExclusiveStartKey: {}, // 다음 조회 키
        ScanIndexForward: input.sort.sortingOrder === 'asc', // 오름차순이면 true, 내림차순이면 false
    };

    settingPageingQuery(input, query);
    // 정렬기준에 따라 호출하는 쿼리가 달라짐
    console.log('query : ', query);
    // 생성일자 기준
    await queryCoBuyingListDAO(query);

    // return response;
};
