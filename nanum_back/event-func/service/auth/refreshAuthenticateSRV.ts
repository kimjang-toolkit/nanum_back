import { AuthToken, UserAuth } from "@interface/auth";
import { validateUserAuthJWT } from "@auth/validateUserAuthJWT";
import { regenerateToken } from "service/auth/authEncrptorSRV";


export const refreshAuthenticate = (token : AuthToken) : AuthToken => {
  let returnToken : AuthToken;
  
  // 토큰 기반 사용자 인증
  validateUserAuthJWT(token, 'refresh');

  // 토큰 다시 생성
  returnToken = regenerateToken(token.user);
  return returnToken;
}


