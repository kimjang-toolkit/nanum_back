import { createAuthResponse } from "@auth/service/authEncrptorSRV";
import { LambdaReturnDto } from "@common/LambdaReturnDto";
import { SocialType } from "@domain/user";
import { SaveNewUserQuery, SaveUserRes, UserMasterRes } from "@interface/user";
import { saveNewUserKaKaoSRV } from "@user/service/saveNewUserKaKaoSRV";
import { saveNewUserLocalSRV } from "@user/service/saveNewUserLocalSRV";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

/**
 * 신규 고객 정보 저장
 * 
 * Post
 * {domain}/api/user/save
 * 
 * @param event
 * @returns
 */
export const saveNewUserCTL = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  let query: SaveNewUserQuery;
  let userMasterRes: UserMasterRes;
  try {
    query = validateInput(event);
  } catch (error) {
    return new LambdaReturnDto(400, { message: (error as Error).message }, event).getLambdaReturnDto();
  }

  try{
    if(query.socialType === SocialType.LOCAL){
      // 일반 회원가입 진행, 단순 입력 값 저장 로직타기
      userMasterRes = await saveNewUserLocalSRV(query);
    } else if(query.socialType === SocialType.KAKAO){
      // 소셜 회원가입 진행, 소셜 로그인 정보 저장 로직 타기
      userMasterRes = await saveNewUserKaKaoSRV(query);
    } else {
      throw new Error("소셜 타입이 올바르지 않습니다.");
    }

    const lamdbdaReturnDto = createAuthResponse(200, userMasterRes, event);
    return lamdbdaReturnDto.getLambdaReturnDto();
  } catch (error) {
    return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
  }

}

function validateInput(event: APIGatewayProxyEventV2): SaveNewUserQuery {
  let query: SaveNewUserQuery;
  try {
    query = JSON.parse(event.body ?? "{}") as SaveNewUserQuery;
    if(!query.id || !query.name || !query.password || !query.socialType){
      throw new Error("입력 값이 올바르지 않습니다.");
    }
  } catch (error) {
    throw new Error("입력 값이 올바르지 않습니다.");
  }
  return query;
}
