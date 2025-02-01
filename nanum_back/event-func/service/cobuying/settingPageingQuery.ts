import { CreatedAtKey } from '@interface/cobuying';
import { CoBuyingQueryParams, PageingQuery } from '@interface/cobuyingList';

export const settingPageingQuery = (input: CoBuyingQueryParams, query: PageingQuery): void => {
    // setLastEvaluatedKey(input, query);
    setExclusiveStartKey(input, query);
    // setIndexName(input, query);
    // setKeyConditionExpression(input, query);
    // if (input.filters) {
    //     setExpressionValues(input, query);
    // }

    // setSortOrder(input, query);
};

/**
 * 필터링 조건 설정
 * @param input
 * @param query
 */
export const setExpressionValues = (input: CoBuyingQueryParams, query: PageingQuery): void => {
    if (input.filters) {
        const filters = input.filters;
        query.FilterExpression = '';
        query.ExpressionAttributeValues = {};
        // FilterExpression 설정 (createdAt 범위 필터링)
        if (filters.createdAt?.from || filters.createdAt?.to) {
            const createdAtFilter = [];
            if (filters.createdAt?.from) {
                createdAtFilter.push('createdAt >= :fromCreatedAt');
                query.ExpressionAttributeValues[':fromCreatedAt'] = { S: filters.createdAt.from };
            }
            if (filters.createdAt?.to) {
                createdAtFilter.push('createdAt <= :toCreatedAt');
                query.ExpressionAttributeValues[':toCreatedAt'] = { S: filters.createdAt.to };
            }
            if (createdAtFilter.length) {
                query.FilterExpression += createdAtFilter.join(' AND ');
            }
        }

        // deadline 범위 필터링
        if (filters.deadline?.from || filters.deadline?.to) {
            const deadlineFilter = [];
            if (filters.deadline?.from) {
                deadlineFilter.push('deadline >= :fromDeadline');
                query.ExpressionAttributeValues[':fromDeadline'] = { S: filters.deadline.from };
            }
            if (filters.deadline?.to) {
                deadlineFilter.push('deadline <= :toDeadline');
                query.ExpressionAttributeValues[':toDeadline'] = { S: filters.deadline.to };
            }
            if (deadlineFilter.length) {
                if (query.FilterExpression && query.FilterExpression.length > 0) {
                    query.FilterExpression += ' AND ';
                }
                query.FilterExpression += deadlineFilter.join(' AND ');
            }
        }

        // ownerName 필터링
        if (filters.ownerName) {
            if (query.FilterExpression && query.FilterExpression.length > 0) {
                query.FilterExpression += ' AND ';
            }
            query.FilterExpression += 'ownerName = :ownerName';
            query.ExpressionAttributeValues[':ownerName'] = { S: filters.ownerName };
        }
    }
};
/***
 * 필터링 조건 설정
 * 정렬순서를 결정
 * 정렬기준에 따라 쿼리 호출 인덱스 결정
 */
// 정렬순서를 결정
// export const setSortOrder = (input: CoBuyingQueryParams, query: PageingQuery): void => {
//     if (input.sort) {
//         const sortOrder = input.sort.sortingOrder;
//         // true는 오름차순
//         if (sortOrder === 'asc') {
//             query.ScanIndexForward = true;
//         } else if (sortOrder == 'desc') {
//             // false는 내림차순
//             query.ScanIndexForward = false;
//         }
//     }
// };

// function setKeyConditionExpression(input: CoBuyingQueryParams, query: PageingQuery) {
//     if (input.sort && input.sort.sortCriteria) {
//         if (input.sort.sortCriteria === 'createdAtId') {
//             query.IndexName = 'CreatedAtIndex';
//             // createdAt 인덱스 이용
//             const filter = input.filters?.createdAt;

//             if (filter) {
//                 if (filter.from && filter.to) {
//                     // from과 to가 모두 있는 경우
//                     query.KeyConditionExpression = 'createdAt BETWEEN :fromCreatedAtIdx AND :toCreatedAtIdx';
//                     query.ExpressionAttributeValues = {
//                         ':fromCreatedAtIdx': { S: filter.from },
//                         ':toCreatedAtIdx': { S: filter.to },
//                     };
//                 } else if (filter.from) {
//                     // from만 있는 경우 from부터 5000-12-31까지
//                     query.KeyConditionExpression = 'createdAt >= :fromCreatedAtIdx';
//                     query.ExpressionAttributeValues = {
//                         ':fromCreatedAtIdx': { S: filter.from },
//                     };
//                 } else if (filter.to) {
//                     // to만 있는 경우 1000-01-01부터 to까지
//                     query.KeyConditionExpression = 'createdAt <= :toCreatedAtIdx';
//                     query.ExpressionAttributeValues = {
//                         ':toCreatedAtIdx': { S: filter.to },
//                     };
//                 }
//             } else {
//                 // from과 to가 전부 없는 경우 전체 범위 조회
//                 query.KeyConditionExpression = 'createdAt BETWEEN :defaultStart AND :defaultEnd';
//                 query.ExpressionAttributeValues = {
//                     ':defaultStart': { S: '1000-01-01' },
//                     ':defaultEnd': { S: '5000-12-31' },
//                 };
//             }
//         } else if (input.sort.sortCriteria === 'deadline') {
//             query.IndexName = 'DeadlineIndex';
//             // deadline 인덱스 이용
//             const filter = input.filters?.deadline;

//             if (filter) {
//                 if (filter.from && filter.to) {
//                     // from과 to가 모두 있는 경우
//                     query.KeyConditionExpression = 'deadline BETWEEN :fromDeadlineIdx AND :toDeadlineIdx';
//                     query.ExpressionAttributeValues = {
//                         ':fromDeadlineIdx': { S: filter.from },
//                         ':toDeadlineIdx': { S: filter.to },
//                     };
//                 } else if (filter.from) {
//                     // from만 있는 경우 from부터 5000-12-31까지
//                     query.KeyConditionExpression = 'deadline >= :fromDeadlineIdx';
//                     query.ExpressionAttributeValues = {
//                         ':fromDeadlineIdx': { S: filter.from },
//                     };
//                 } else if (filter.to) {
//                     // to만 있는 경우 1000-01-01부터 to까지
//                     query.KeyConditionExpression = 'deadline <= :toDeadlineIdx';
//                     query.ExpressionAttributeValues = {
//                         ':toDeadlineIdx': { S: filter.to },
//                     };
//                 }
//             } else {
//                 // from과 to가 전부 없는 경우 전체 범위 조회
//                 query.KeyConditionExpression = 'deadline BETWEEN :defaultStart AND :defaultEnd';
//                 query.ExpressionAttributeValues = {
//                     ':defaultStart': { S: '1000-01-01' },
//                     ':defaultEnd': { S: '5000-12-31' },
//                 };
//             }
//         }
//     }
// }
// function setIndexName(input: CoBuyingQueryParams, query: PageingQuery) {
//     if (input.sort && input.sort.sortCriteria === 'deadline') {
//         query.IndexName = 'DeadlineIndex';
//     } else if (input.sort && input.sort.sortCriteria === 'createdAtId') {
//         // 기본 인덱스를 생성일자 기준 인덱스로 설정
//         query.IndexName = 'CreatedAtIndex';
//     } else {
//         query.IndexName = 'PagenationIndex';
//     }
// }

function setExclusiveStartKey(input: CoBuyingQueryParams, query: PageingQuery) {
    if (input.lastEvaluatedKey) {
        query.ExclusiveStartKey = {};

        query.ExclusiveStartKey['createdAtId'] = { S: input.lastEvaluatedKey.createdAtId };
        query.ExclusiveStartKey['id'] = { S: input.lastEvaluatedKey.id };
        query.ExclusiveStartKey['ownerName'] = { S: input.lastEvaluatedKey.ownerName };
        query.ExclusiveStartKey['deletedYN'] = { S: 'N' };
    }
}
