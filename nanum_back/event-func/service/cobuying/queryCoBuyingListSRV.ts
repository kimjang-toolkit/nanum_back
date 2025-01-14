import { CoBuyingListRes, CoBuyingQueryParams, CoBuyingSimple } from '@api-interface/cobuying';

export const queryCoBuyingListSRV = async (input: CoBuyingQueryParams): Promise<CoBuyingListRes> => {
    let response: CoBuyingListRes;
    let coBuyingList: CoBuyingSimple[];
    const sortStd = input.sort.sortCriteria;
    // 정렬기준에 따라 호출하는 쿼리가 달라짐

    // 생성일자 기준
    if (sortStd === 'createdAt') {
        coBuyingList = await queryCoBuyingListByCreatedAtDAO(input);
    } else if (sortStd === 'deadline') {
        coBuyingList = await queryCoBuyingListByDeadlineDAO(input);
    }

    // 마감일자 기준

    return response;
};
