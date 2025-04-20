import { validateTokenFromHeader } from "@auth/service/validateTokenSRV";
import { APIERROR } from "@common/responseType";
import { UserAuthDto } from "@interface/auth";
import { ManageCoBuyingDto, SharingCheckCoBuyingParams, SharingCheckCoBuyingReq } from "@interface/manage";
import { sharingCheckCoBuyingSRV } from "@manage/service/sharingCheckCoBuyingSRV";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { LambdaReturnDto } from "@common/LambdaReturnDto";

export const sharingCheckCoBuyingHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  
  let sharingCoBuyingParams: SharingCheckCoBuyingParams;
  
  try {
    sharingCoBuyingParams = await validateSharingCoBuying(event);
  } catch (error) {
      if (error instanceof APIERROR) {
          return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
      }
      return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
  }

  try{
    const message: ManageCoBuyingDto = await sharingCheckCoBuyingSRV(sharingCoBuyingParams);

    return new LambdaReturnDto(200, message, event).getLambdaReturnDto();
  } catch (error) {
    if (error instanceof APIERROR) {
      return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
    }
    return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
  }
  
};

async function validateSharingCoBuying(event: APIGatewayProxyEventV2): Promise<SharingCheckCoBuyingParams> {
  let sharingReq: SharingCheckCoBuyingReq;
  try {
    sharingReq = JSON.parse(event.body || '{}');
  } catch (error) {
    throw new APIERROR(400, "수정할 속성을 입력해주세요");
  }
  console.log(sharingReq);

  // 공구글 나눔 완료 체크 요청 유효성 검사
  if (sharingReq.name === undefined || sharingReq.isShared === undefined) {
    throw new APIERROR(400, "공구글 나눔 완료 체크 요청 유효성 검사 실패");
  }
  
  // check 값이 true 또는 false 인지 확인
  if (sharingReq.isShared !== true && sharingReq.isShared !== false) {
    throw new APIERROR(400, "공구글 나눔 완료 체크 값이 옳바르지 않아요.");
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
    name: sharingReq.name,
    isShared: sharingReq.isShared,
    coBuyingId: coBuyingId,
    ownerName: ownerName,
  } as SharingCheckCoBuyingParams;
}
