import { CoBuyingSimple } from '@api-interface/cobuying';

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

    const queryInput = {
      TableName : process.env.CoBuyingTableName || '', // 테이블 이름
      IndexName : ''
    }
  }


};
