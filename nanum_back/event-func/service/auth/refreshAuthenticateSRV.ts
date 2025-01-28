import { AuthToken } from '@interface/auth';
import { validateUserAuthJWT } from '@auth/validateUserAuthJWTSRV';
import { regenerateToken } from 'service/auth/authEncrptorSRV';

export const refreshAuthenticate = (token: AuthToken): AuthToken => {
    // 토큰 기반 사용자 인증
    validateUserAuthJWT(token, 'refresh');

    // 토큰 다시 생성
    const returnToken = regenerateToken(token.user);
    return returnToken;
};
