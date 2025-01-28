import { extractPayload } from '@auth/authEncrptorSRV';
import { AuthToken, UserAuth } from '@interface/auth';
import { APIERROR } from 'common/responseType';
import { JwtPayload } from 'jsonwebtoken';

export const validateUserAuthJWT = (token: AuthToken, tokenType: string): void => {
    const userAuth: UserAuth = token.user;

    let jwt: string;
    if (tokenType === 'access') {
        jwt = token.accessToken;
    } else if (tokenType === 'refresh') {
        jwt = token.refreshToken;
    } else {
        throw new APIERROR(500, '토큰 선택에 문제가 있습니다.');
    }

    // token 유효성 검증
    const tokenValide: JwtPayload = extractPayload(jwt);
    if (!tokenValide) {
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
    const decodedOwnerName = tokenValide.ownerName as string;
    const decodedCoBuyingId = tokenValide.coBuyingId as string;

    // 유저 정보와 토큰이 동일한 정보인지 검증
    if (decodedOwnerName != userAuth.ownerName || decodedCoBuyingId != userAuth.coBuyingId) {
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
};
