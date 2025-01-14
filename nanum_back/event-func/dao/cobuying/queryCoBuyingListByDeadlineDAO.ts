import { CoBuyingQueryParams, CoBuyingSimple, DeadlineKey } from '@api-interface/cobuying';

export const queryCoBuyingListByDeadlineDAO = async (input: CoBuyingQueryParams): Promise<CoBuyingSimple[]> => {

  try{

  //   const params = {
  //     TableName: process.env.CoBuyingTableName || '', // 테이블 이름
  //     IndexName: 'OwnerNameGSI', // 사용할 GSI
  //     KeyConditionExpression: 'ownerName = :ownerName AND createdAtId = :createdAtId', // 쿼리 조건
  //     ExpressionAttributeValues: {
  //         ':ownerName': { S: ownerName }, // GSI 파티션 키 값
  //         ':createdAtId': { S: createdAtId }, // GSI 정렬 키 값
  //     },
  // };

    let queryInput : any = {
      TableName : process.env.CoBuyingTableName || '', // 테이블 이름
      IndexName : 'DeadlineIndex',
      Limit: input.size || 20,
      FilterExpression: ""
    }

    // 이전 값이 있으면?
    if(input.lastEvaluatedKey && input.lastEvaluatedKey.key === 'deadline'){
      const lastEvaluatedKey : DeadlineKey = input.lastEvaluatedKey
      queryInput.ExclusiveStartKey = {
        deadline : lastEvaluatedKey.deadline,
        id : lastEvaluatedKey.id
      }
    }

    // 필터링이 필요하면?
    // 필터링을 위한 Expression 초기화
    const expressionValues: any = {};
    if(input.filters){
      const filters = input.filters;
       // FilterExpression 설정 (createdAt 범위 필터링)
      if (filters.createdAt?.from || filters.createdAt?.to) {
        const createdAtFilter = [];
        if (filters.createdAt?.from) {
          createdAtFilter.push("createdAt >= :fromCreatedAt");
          expressionValues[":fromCreatedAt"] = { S: filters.createdAt.from };
        }
        if (filters.createdAt?.to) {
          createdAtFilter.push("createdAt <= :toCreatedAt");
          expressionValues[":toCreatedAt"] = { S: filters.createdAt.to };
        }
        if (createdAtFilter.length) {
          queryInput.FilterExpression += createdAtFilter.join(" AND ");
        }
      }

      // deadline 범위 필터링
      if (filters.deadline?.from || filters.deadline?.to) {
        const deadlineFilter = [];
        if (filters.deadline?.from) {
          deadlineFilter.push("deadline >= :fromDeadline");
          expressionValues[":fromDeadline"] = { S: filters.deadline.from };
        }
        if (filters.deadline?.to) {
          deadlineFilter.push("deadline <= :toDeadline");
          expressionValues[":toDeadline"] = { S: filters.deadline.to };
        }
        if (deadlineFilter.length) {
          if (queryInput.FilterExpression && queryInput.FilterExpression.length > 0) {
            queryInput.FilterExpression += " AND ";
          }
          queryInput.FilterExpression += deadlineFilter.join(" AND ");
        }
      }

      // ownerName 필터링
      if (filters.ownerName) {
        const ownerNameFilter = [];
        ownerNameFilter.push("ownerName = :ownerName")
        queryInput.FilterExpression += {S : filters.ownerName}
      }

    }
    // 정렬순서를 바꾸면?
  }


};
