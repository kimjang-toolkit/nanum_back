import { ReturnValue } from "@aws-sdk/client-dynamodb";
import { queryCoBuyingDetail } from "@cobuying/queryCoBuyingDetailDAO";
import { APIERROR } from "@common/responseType";
import { CoBuyingDetail } from "@interface/cobuying";
import { ManageCoBuyingDto, ManageCoBuyingParams } from "@interface/manage";
import { manageCoBuyingDAO } from "@manage/manageCoBuyingDAO";
import { UpdateDynamoQuery } from "@query-interface/application";


export const manageCoBuyingSRV = async (manageCoBuyingParams: ManageCoBuyingParams) => {
  let coBuyingDetail: CoBuyingDetail;
  
  try{
    coBuyingDetail = await queryCoBuyingDetail(
      manageCoBuyingParams.ownerName,
      manageCoBuyingParams.coBuyingId,
    );

    let updateCommand: UpdateDynamoQuery;
    updateCommand = getUpdateCommand(manageCoBuyingParams, coBuyingDetail);

    const message: ManageCoBuyingDto = await manageCoBuyingDAO(updateCommand);
    return message;
  } catch (error) {
    if (error instanceof APIERROR) {
      throw new APIERROR(error.statusCode, error.message);
    }
    throw new APIERROR(500, '공구글을 조회하는 중 오류가 발생했습니다.');
  }


}

function getUpdateCommand(manageCoBuyingParams: ManageCoBuyingParams, coBuyingDetail: CoBuyingDetail): UpdateDynamoQuery {


  let updateExpression = 'SET ';
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  /**
   * 공구 상태 변경 시 실행
   * 공구 상태 변경 시 나머지 필드는 무시된다
   */
  if(manageCoBuyingParams.coBuyingStatus !== undefined && manageCoBuyingParams.coBuyingStatus){
    updateExpression += '#coBuyingStatus = :coBuyingStatus, ';
    expressionAttributeValues[':coBuyingStatus'] = manageCoBuyingParams.coBuyingStatus.valueOf();
    expressionAttributeNames['#coBuyingStatus'] = 'coBuyingStatus';
    console.log("As-Is: ", coBuyingDetail.coBuyingStatus, "To-Be: ", manageCoBuyingParams.coBuyingStatus.valueOf());
  } else{
    if(manageCoBuyingParams.memo !== undefined && manageCoBuyingParams.memo !== coBuyingDetail.memo){
      updateExpression += '#memo = :memo, ';
      expressionAttributeValues[':memo'] = manageCoBuyingParams.memo;
      expressionAttributeNames['#memo'] = 'memo';
      console.log("As-Is: ", coBuyingDetail.memo, "To-Be: ", manageCoBuyingParams.memo);
    }
  
    if(manageCoBuyingParams.productLink !== undefined && manageCoBuyingParams.productLink !== coBuyingDetail.productLink){
      updateExpression += '#productLink = :productLink, ';
      expressionAttributeValues[':productLink'] = manageCoBuyingParams.productLink;
      expressionAttributeNames['#productLink'] = 'productLink';
      console.log("As-Is: ", coBuyingDetail.productLink, "To-Be: ", manageCoBuyingParams.productLink);
    }
  
    if(manageCoBuyingParams.productName !== undefined && manageCoBuyingParams.productName !== coBuyingDetail.productName){
      updateExpression += '#productName = :productName, ';
      expressionAttributeValues[':productName'] = manageCoBuyingParams.productName;
      expressionAttributeNames['#productName'] = 'productName';
      console.log("As-Is: ", coBuyingDetail.productName, "To-Be: ", manageCoBuyingParams.productName);
    }
  
    if(manageCoBuyingParams.deadline !== undefined && manageCoBuyingParams.deadline !== coBuyingDetail.deadline){
      updateExpression += '#deadline = :deadline, ';
      expressionAttributeValues[':deadline'] = manageCoBuyingParams.deadline;
      expressionAttributeNames['#deadline'] = 'deadline';
      console.log("As-Is: ", coBuyingDetail.deadline, "To-Be: ", manageCoBuyingParams.deadline);
    } 
  }

  /**
   * 나눔 정보 변경 시 업데이트문 작성
   * 다만, 나눔 시간은 마감시간 이후에 가능함.
   */
  if(manageCoBuyingParams.sharingDateTime !== undefined && manageCoBuyingParams.sharingDateTime !== coBuyingDetail.sharingDateTime){
    updateExpression += '#sharingDateTime = :sharingDateTime, ';
    expressionAttributeValues[':sharingDateTime'] = manageCoBuyingParams.sharingDateTime;
    expressionAttributeNames['#sharingDateTime'] = 'sharingDateTime';
    console.log("As-Is: ", coBuyingDetail.sharingDateTime, "To-Be: ", manageCoBuyingParams.sharingDateTime);

    if(manageCoBuyingParams.sharingDateTime < coBuyingDetail.deadline){
      throw new APIERROR(400, '나눔 시간은 마감시간 이후에 가능해요.');
    }
  }

  if(manageCoBuyingParams.sharingLocation !== undefined && manageCoBuyingParams.sharingLocation !== coBuyingDetail.sharingLocation){
    updateExpression += '#sharingLocation = :sharingLocation, ';
    expressionAttributeValues[':sharingLocation'] = manageCoBuyingParams.sharingLocation;
    expressionAttributeNames['#sharingLocation'] = 'sharingLocation';
    console.log("As-Is: ", coBuyingDetail.sharingLocation, "To-Be: ", manageCoBuyingParams.sharingLocation);
  }

  if(Object.keys(expressionAttributeValues).length === 0){
    throw new APIERROR(400, '수정할 속성이 없어요.');
  }

  // 만약 updateExpression 맨 마지막에 쉼표가 있으면 제거
  if(updateExpression.endsWith(', ')){
    updateExpression = updateExpression.slice(0, -2);
  }

  const param = {
      TableName: process.env.CoBuyingTableName || 'CoBuyingTable',
      Key: {
          ownerName: manageCoBuyingParams.ownerName,
          id: manageCoBuyingParams.coBuyingId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: ReturnValue.ALL_NEW,
  } as UpdateDynamoQuery;
  return param;
}

