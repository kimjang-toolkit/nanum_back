import { LambdaReturnDto } from "@common/LambdaReturnDto";
import { SaveNewUserQuery, SaveUserRes } from "@interface/user";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

/**
 * 신규 고객 정보 저장
 */
export const saveNewUser = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  let query: SaveNewUserQuery;
  let result: SaveUserRes;
  try {
    query = validateInput(event);
  } catch (error) {
    return new LambdaReturnDto(400, { message: (error as Error).message }, event).getLambdaReturnDto();
  }


  if(query.socialType.type === 'local'){
    // 일반 회원가입 진행, 단순 입력 값 저장 로직타기
    result = await saveNewUserLocalSRV(query);
  } else if(query.socialType.type === 'kakao'){
    // 소셜 회원가입 진행, 소셜 로그인 정보 저장 로직 타기
    // result = await saveNewUserKaKaoSRV(query);
  }

  return new LambdaReturnDto(200, { message: '고객 정보 저장 완료' }, event).getLambdaReturnDto();
}

function validateInput(event: APIGatewayProxyEventV2): SaveNewUserQuery {
  throw new Error("Function not implemented.");
}
