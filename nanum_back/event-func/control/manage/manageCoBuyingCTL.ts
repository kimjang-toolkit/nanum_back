import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { LambdaReturnDto } from "dto/LambdaReturnDto";
import { ManageCoBuyingParams, ManageCoBuyingReq } from "@interface/manage";
import { APIERROR } from "@common/responseType";
import { manageCoBuyingSRV } from "@manage/manageCoBuyingSRV";
import { CoBuyingStatus } from "@domain/cobuying";
import { validateTokenFromHeader } from "@auth/validateTokenSRV";
import { UserAuthDto } from "@interface/auth";

export const manageCoBuyingHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {

  let manageCoBuyingParams: ManageCoBuyingParams;
  
  try {
    manageCoBuyingParams = await validateManageCoBuying(event);
  } catch (error) {
      if (error instanceof APIERROR) {
          return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
      }
      return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
  }
  try{
    const message = await manageCoBuyingSRV(manageCoBuyingParams);

    return new LambdaReturnDto(200, message, event).getLambdaReturnDto();
  } catch (error) {
    if (error instanceof APIERROR) {
      return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
    }
    return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
  }
  
}

/**
 * 공구 관리 요청 유효성 검사
 * @param event 
 * @returns 수정할 속성 Request
 * 
 * 하나 이상의 속성이 있어야 함
 */
async function validateManageCoBuying(event: APIGatewayProxyEventV2): Promise<ManageCoBuyingParams> {
  let manageCoBuyingReq: ManageCoBuyingReq;
  try {
    manageCoBuyingReq = JSON.parse(event.body || '{}');
  } catch (error) {
    throw new APIERROR(400, "수정할 속성을 입력해주세요");
  }
  console.log(manageCoBuyingReq);
  /**
   * 공구 status 변경 시 다른 속성을 변경할 수 없다.
   * 공구 status가 CoBuyingStatus에 속한 상태인지 확인해야함.
   */
  if (manageCoBuyingReq.coBuyingStatus !== undefined && manageCoBuyingReq.coBuyingStatus) {
    // Check if the status is a valid CoBuyingStatus
    const isValidStatus = Object.values(CoBuyingStatus).includes(Number(manageCoBuyingReq.coBuyingStatus));
    console.log('isValidStatus : ', isValidStatus);
    if (!isValidStatus) {
        throw new APIERROR(400, "유효하지 않은 공구 상태입니다.");
    }

    if (manageCoBuyingReq.memo !== undefined || manageCoBuyingReq.productLink !== undefined || manageCoBuyingReq.productName !== undefined || manageCoBuyingReq.deadline !== undefined) {
        throw new APIERROR(400, "공구 상태 변경 시 다른 속성을 변경할 수 없어요.");
    }
  }

  if (Object.keys(manageCoBuyingReq).length === 0) {
    throw new APIERROR(400, "수정할 속성을 입력해주세요");
  }
  

  const userAuth : UserAuthDto = await validateTokenFromHeader(event);

  const coBuyingId = event.pathParameters?.coBuyingId;
  const ownerName = event.queryStringParameters?.ownerName;

  if (!coBuyingId || !ownerName) {
    throw new APIERROR(400, "공구 아이디와 공구장 이름을 입력해주세요");
  }else{
    if(userAuth.coBuyingId !== coBuyingId || userAuth.ownerName !== ownerName){
      console.log('userAuth : ', userAuth);
      console.log('coBuyingId : ', coBuyingId);
      console.log('ownerName : ', ownerName);
      throw new APIERROR(401, "공구장 인증 정보가 옳바르지 않아요.");
    }
  }

  return {
    coBuyingId,
    ownerName,
    ...manageCoBuyingReq
  } as ManageCoBuyingParams;
}
