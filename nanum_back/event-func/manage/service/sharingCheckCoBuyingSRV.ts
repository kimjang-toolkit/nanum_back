import { queryCoBuyingDetail } from "@cobuying/dao/queryCoBuyingDetailDAO";
import { APIERROR } from "@common/responseType";
import { getFormattedKoreaTime } from '@common/time';
import { Attendee } from '@domain/user';
import { CoBuyingDetail } from "@interface/cobuying";
import { ManageCoBuyingDto, SharingCheckCoBuyingParams } from "@interface/manage";
import { manageCoBuyingDAO } from '@manage/dao/manageCoBuyingDAO';
import { UpdateDynamoQuery } from "@query-interface/application";
import { ReturnValue } from '@aws-sdk/client-dynamodb';

export const sharingCheckCoBuyingSRV = async (sharingCoBuyingParams: SharingCheckCoBuyingParams): Promise<ManageCoBuyingDto> => {
  let coBuyingDetail : CoBuyingDetail;
  let updateCommand: UpdateDynamoQuery;
  
  try{
    // 1. 공구글 조회
    // 2. 존재하는 공구글인지 확인
    coBuyingDetail = await queryCoBuyingDetail(
      sharingCoBuyingParams.ownerName,
      sharingCoBuyingParams.coBuyingId,
    );

    // 3. Update 쿼리 작성

    updateCommand = getUpdateCommand(sharingCoBuyingParams, coBuyingDetail);

    // 3-1. Update 쿼리에는 신청자의 체크 값과 체크 시간을 저장하기
    const message: ManageCoBuyingDto = await manageCoBuyingDAO(updateCommand);
    return message;

  }catch(error){
    if (error instanceof APIERROR) {
      throw new APIERROR(error.statusCode, error.message);
    }
    throw new APIERROR(500, '공구글을 조회하는 중 오류가 발생했습니다.');
  }
}

function getUpdateCommand(sharingCoBuyingParams: SharingCheckCoBuyingParams, coBuyingDetail: CoBuyingDetail): UpdateDynamoQuery {
  let updateExpression = 'SET ';
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  // coBuyingDetail에서 신청자 리스트 중 나눔 체크한 신청자의 인덱스 찾기
  const attendeeIndex = coBuyingDetail.attendeeList?.findIndex((attendee: Attendee) => attendee.name === sharingCoBuyingParams.name);

  if (attendeeIndex === -1) {
    throw new APIERROR(400, '존재하지 않는 신청자입니다.');
  }

  
  // 해당 인덱스의 attendeeSharingCheckYN 값을 업데이트 해주기
  const ynOptionKey = `#attendeeList[${attendeeIndex}].isShared`;
  const ynValueKey = `:isShared_${attendeeIndex}`;

  updateExpression += ` ${ynOptionKey} = ${ynValueKey}`;
  expressionAttributeNames['#attendeeList'] = 'attendeeList';
  expressionAttributeValues[ynValueKey] = sharingCoBuyingParams.isShared;

  // 해당 인덱스의 attendeeSharingCheckAt 값을 업데이트 해주기
  const atOptionKey = `#attendeeList[${attendeeIndex}].sharingCheckAt`;
  const atValueKey = `:sharingCheckAt_${attendeeIndex}`;

  updateExpression += `, ${atOptionKey} = ${atValueKey}`;
  expressionAttributeNames['#attendeeList'] = 'attendeeList';
  expressionAttributeValues[atValueKey] = getFormattedKoreaTime();

  const param = {
    TableName: `${process.env.DEPLOYSTAGE}-${process.env.CoBuyingTableName}` || 'Dev-CoBuyingTable',
    Key: {
        ownerName: coBuyingDetail.ownerName,
        id: coBuyingDetail.id,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: ReturnValue.ALL_NEW,
  } as UpdateDynamoQuery;

  return param;
}