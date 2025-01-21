import { queryCoBuyingListDAO } from '@cobuying/queryCoBuyingListDAO';
import { settingPageingQuery } from '@cobuying/settingPageingQuery';
import { CoBuyingPageingRes, CoBuyingQueryParams, PageingQuery } from '@interface/cobuyingList';

export const queryCoBuyingListSRV = async (input: CoBuyingQueryParams): Promise<CoBuyingPageingRes> => {
    const query: PageingQuery = {
        TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        Limit: input.size || 20, // 최대 개수 (기본값 20)
        ScanIndexForward: input.sort.sortingOrder === 'asc', // 오름차순이면 true, 내림차순이면 false
        // CoBuyingSimple을 출력하게 기본 속성 정의. 정렬이나 필터링할 때 기준 속성 추가
        ProjectionExpression:
            'id, coBuyingStatus, totalPrice, attendeeCount, productName, ownerName, deadline, createdAt',
    };

    settingPageingQuery(input, query);
    // 정렬기준에 따라 호출하는 쿼리가 달라짐
    console.log('query : ', query);
    // 생성일자 기준
    const response: CoBuyingPageingRes = await queryCoBuyingListDAO(query);
    return response;
    // return response;
};
