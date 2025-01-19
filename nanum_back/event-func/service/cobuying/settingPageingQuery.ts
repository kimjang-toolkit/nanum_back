import { CoBuyingQueryParams, CreatedAtKey, DeadlineKey, PageingQuery } from '@api-interface/cobuying';

export const settingPageingQuery = (input: CoBuyingQueryParams, query: PageingQuery): void => {
    setTableIndex(input, query);
    setLastEvaluatedKey(input, query);
    if (input.filters) {
        setKeyConditionExpression(input, query);
        setExpressionValues(input, query);
    }

    setSortOrder(input, query);
};

// 다음 조회를 위한 이전 키 값 추가
export const setLastEvaluatedKey = (input: CoBuyingQueryParams, query: PageingQuery): void => {
    if (input.lastEvaluatedKey) {
        if (input.lastEvaluatedKey?.key === 'deadline') {
            const lastEvaluatedKey: DeadlineKey = input.lastEvaluatedKey;
            query.ExclusiveStartKey = {
                deadline: lastEvaluatedKey.deadline,
                id: lastEvaluatedKey.id,
            };
        } else if (input.lastEvaluatedKey?.key === 'createdAt') {
            const lastEvaluatedKey: CreatedAtKey = input.lastEvaluatedKey;
            query.ExclusiveStartKey = {
                createdAt: lastEvaluatedKey.createdAt,
                id: lastEvaluatedKey.id,
            };
        }
    }
};

export const setExpressionValues = (input: CoBuyingQueryParams, query: PageingQuery): void => {
    const expressionValues: any = {};
    if (input.filters) {
        const filters = input.filters;

        // FilterExpression 설정 (createdAt 범위 필터링)
        if (filters.createdAt?.from || filters.createdAt?.to) {
            const createdAtFilter = [];
            if (filters.createdAt?.from) {
                createdAtFilter.push('createdAt >= :fromCreatedAt');
                expressionValues[':fromCreatedAt'] = { S: filters.createdAt.from };
            }
            if (filters.createdAt?.to) {
                createdAtFilter.push('createdAt <= :toCreatedAt');
                expressionValues[':toCreatedAt'] = { S: filters.createdAt.to };
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
                expressionValues[':fromDeadline'] = { S: filters.deadline.from };
            }
            if (filters.deadline?.to) {
                deadlineFilter.push('deadline <= :toDeadline');
                expressionValues[':toDeadline'] = { S: filters.deadline.to };
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
            expressionValues[':ownerName'] = { S: filters.ownerName };
        }
    }

    // ExpressionAttributeValues에 값 할당
    query.ExpressionAttributeValues = expressionValues;
};

// [필수!] 정렬순서를 결정
export const setSortOrder = (input: CoBuyingQueryParams, query: PageingQuery): void => {
    if (input.sort) {
        const sortOrder = input.sort.sortingOrder;
        // true는 오름차순
        if (sortOrder === 'asc') {
            query.ScanIndexForward = true;
        } else if (sortOrder == 'desc') {
            // false는 내림차순
            query.ScanIndexForward = false;
        }
    }
};
function setTableIndex(input: CoBuyingQueryParams, query: PageingQuery) {
    if (input.sort.sortCriteria === 'deadline') {
        query.IndexName = 'DeadlineIndex';
    }
}
function setKeyConditionExpression(input: CoBuyingQueryParams, query: PageingQuery) {
    if (input.sort.sortCriteria) {
        if (input.sort.sortCriteria === 'createdAt') {
            query.KeyConditionExpression = '';
        }
    }
}
