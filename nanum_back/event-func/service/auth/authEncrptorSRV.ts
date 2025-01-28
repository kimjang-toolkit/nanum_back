import { CoBuyingOwnerAuth, UserAuth } from '@interface/auth';
import { AuthToken } from '@interface/auth';
import { APIERROR } from 'common/responseType';
import { getKoreaTime } from 'common/time';
import { createHmac, timingSafeEqual } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.AUTHSECRETKEY || 'your-secret-key'; // 서버에서만 관리

// 비밀번호 해싱 함수
export async function hashPassword(password: string): Promise<string> {
    // 비밀키를 사용해 HMAC 생성 => 인증키 + 해싱
    const hashedPassword = createHmac('sha256', SECRET_KEY).update(password).digest('hex');
    return hashedPassword;
}

// 비밀번호 검증 함수
export function verifyPassword(inputPassword: string, storedHash: string): boolean {
    const hashedInputPassword = createHmac('sha256', SECRET_KEY).update(inputPassword).digest('hex');

    // 문자열 비교 (타이밍 공격 방지)
    const inputBuffer = Buffer.from(hashedInputPassword);
    const storedBuffer = Buffer.from(storedHash);

    if (inputBuffer.length !== storedBuffer.length) {
        return false; // 길이가 다르면 즉시 false
    }

    return timingSafeEqual(inputBuffer, storedBuffer);
}

export function generateToken(owner: CoBuyingOwnerAuth): AuthToken {
    const refreshTokenExpiresIn = 1000 * 60 * 60 * 24 * 7;

    const tokenOwner = {
        ownerName: owner.ownerName,
        coBuyingId: owner.coBuyingId,
    } as UserAuth;

    const accessTokenExpiresIn = 1000 * 60 * 60;

    const accessToken = createToken(tokenOwner, accessTokenExpiresIn);

    // 리프레시 토큰 생성 유효기간 7일
    const refreshToken = createToken(tokenOwner, refreshTokenExpiresIn);

    const token = getAuthToken(
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
        tokenOwner,
        'Bearer',
        'owner',
    );

    return token;
}

export function regenerateToken(auth: UserAuth): AuthToken {
    const accessTokenExpiresIn: number = 1000 * 60 * 60;
    const refreshTokenExpiresIn: number = 1000 * 60 * 60 * 24 * 7;

    const accessToken = createToken(auth, accessTokenExpiresIn);

    // 리프레시 토큰 생성 유효기간 7일
    const refreshToken = createToken(auth, refreshTokenExpiresIn);

    const token = getAuthToken(
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
        auth,
        'Bearer',
        'owner',
    );

    return token;
}

function getAuthToken(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
    tokenOwner: UserAuth,
    tokenType: string,
    scope: string,
): AuthToken {
    const issuedAt = getKoreaTime();
    const token: AuthToken = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresIn: accessTokenExpiresIn,
        refreshTokenExpiresIn: refreshTokenExpiresIn,
        user: tokenOwner,
        tokenType: tokenType,
        scope: scope,
        issuedAt: issuedAt,
    } as AuthToken;
    return token;
}

function createToken(tokenOwner: UserAuth, expiresIn: number): string {
    const accessToken = jwt.sign(tokenOwner, SECRET_KEY, { expiresIn: expiresIn });
    return accessToken;
}

export function extractPayload(token: string): JwtPayload {
    // jwt를 이용해서 token이 같은 암호키를 이용해서 만들어진 jwt인지 검증
    try {
        // jwt를 이용해서 token이 같은 암호키를 이용해서 만들어진 jwt인지 검증
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded as JwtPayload; // 디코딩이 성공하면 true 반환
    } catch (error) {
        console.error('Token validation error:', error);
        // 검증 실패 시 ERROR 반환
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
}
