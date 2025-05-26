import { getLambdaReturnDto } from "@auth/service/authEncrptorSRV";
import { LambdaReturnDto } from "@common/LambdaReturnDto";
import { SocialType } from "@domain/user";
import { SaveNewUserQuery, SaveUserResDto } from "@interface/user";
import { saveNewUserKaKaoSRV } from "@user/service/saveNewUserKaKaoSRV";
import { SaveLocalUserService } from "@user/service/saveUser";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

/**
 * 신규 고객 정보 저장
 * 
 * Post
 * {domain}/api/user
 * 
 * @param event
 * @returns
 */
export const saveNewUserCTL = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  let query: SaveNewUserQuery;
  let userMasterRes: SaveUserResDto;

  try {
    query = validateInput(event);
    console.log("event 유효성 검사 통과");
  } catch (error) {
    return new LambdaReturnDto(400, { message: (error as Error).message }, event).getLambdaReturnDto();
  }

  try{
    if(query.socialType === SocialType.LOCAL){
      // 일반 회원가입 진행, 단순 입력 값 저장 로직타기
      const saveUserService = new SaveLocalUserService();
      userMasterRes = await saveUserService.saveUser(query);
    } else if(query.socialType === SocialType.KAKAO){
      // 소셜 회원가입 진행, 소셜 로그인 정보 저장 로직 타기
      userMasterRes = await saveNewUserKaKaoSRV(query);
    } else {
      throw new Error("소셜 타입이 올바르지 않습니다.");
    }
    console.log("userMasterRes 생성 완료");

    const lamdbdaReturnDto = getLambdaReturnDto(200, userMasterRes, event);
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
