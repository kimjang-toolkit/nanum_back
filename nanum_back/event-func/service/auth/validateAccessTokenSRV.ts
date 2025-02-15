import { extractPayload } from '@auth/authEncrptorSRV';
import { AuthToken } from '@interface/auth';
import { APIERROR } from 'common/responseType';
import { JwtPayload } from 'jsonwebtoken';

export const validateAccessTokenSRV = (token: string, tokenType: string): void => {
    // let userAuth: UserAuth;

    let jwt: string;

    // token 유효성 검증
    const tokenValide: JwtPayload = extractPayload(token);
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
