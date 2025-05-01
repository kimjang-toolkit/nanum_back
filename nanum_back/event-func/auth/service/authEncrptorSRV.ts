import { LambdaReturnDto } from '@common/LambdaReturnDto';
import { CoBuyingOwnerAuth, CookieOptions, HeaderOptions, OwnerUserAuthDTO, TokenName } from '@interface/auth';
import { AuthToken } from '@interface/auth';
import { UserMasterRes } from '@interface/user';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { APIERROR } from 'common/responseType';
import { getKoreaTime } from 'common/time';
import { createHmac, timingSafeEqual } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.AUTHSECRETKEY || 'your-secret-key'; // 서버에서만 관리

const refreshTokenExpiresIn = 1000 * 60 * 1; // 1분
const accessTokenExpiresIn = 1000 * 40; // 40초

// ==================== 비밀번호 관련 함수 ====================

export async function hashPassword(password: string): Promise<string> {
    const hashedPassword = createHmac('sha256', SECRET_KEY).update(password).digest('hex');
    return hashedPassword;
}

export function verifyPassword(inputPassword: string, storedHash: string): boolean {
    const hashedInputPassword = createHmac('sha256', SECRET_KEY).update(inputPassword).digest('hex');

    const inputBuffer = Buffer.from(hashedInputPassword);
    const storedBuffer = Buffer.from(storedHash);

    if (inputBuffer.length !== storedBuffer.length) {
        return false;
    }

    return timingSafeEqual(inputBuffer, storedBuffer);
}

// ==================== 토큰 생성 관련 함수 ====================

/**
 * 임의의 body를 받아서 JWT를 생성하고, 해당 값을 반환
 */
function createToken<T>(body: T, expiresIn: number): string {
    const accessToken = jwt.sign(JSON.stringify(body), SECRET_KEY, { expiresIn: expiresIn });
    return accessToken;
}

function createCobuyingToken(tokenOwner: OwnerUserAuthDTO, expiresIn: number): string {
    return createToken<OwnerUserAuthDTO>(tokenOwner, expiresIn);
}

function getCobuyingAuthToken(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
    tokenOwner: OwnerUserAuthDTO,
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

function getAuthToken<T>(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
    body: T,
    tokenType: string,
    scope: string,
): AuthToken {
    const issuedAt = getKoreaTime();
    const token: AuthToken = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresIn: accessTokenExpiresIn,
        refreshTokenExpiresIn: refreshTokenExpiresIn,
        user: body,
        tokenType: tokenType,
        scope: scope,
        issuedAt: issuedAt,
    } as AuthToken;
    return token;
}

function createJwt<T>(body: T): AuthToken {
    const accessToken = createToken<T>(body, accessTokenExpiresIn);
    const refreshToken = createToken<T>(body, refreshTokenExpiresIn);

    const token = getAuthToken<T>(
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
        body,
        'Bearer',
        'owner',
    );
    return token;
}

export function generateToken(owner: CoBuyingOwnerAuth): AuthToken {
    const tokenOwner = {
        ownerName: owner.ownerName,
        coBuyingId: owner.coBuyingId,
    } as OwnerUserAuthDTO;

    const accessToken = createCobuyingToken(tokenOwner, accessTokenExpiresIn);
    const refreshToken = createCobuyingToken(tokenOwner, refreshTokenExpiresIn);

    const token = getCobuyingAuthToken(
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

export function regenerateToken(auth: OwnerUserAuthDTO): AuthToken {
    const accessToken = createCobuyingToken(auth, accessTokenExpiresIn);
    const refreshToken = createCobuyingToken(auth, refreshTokenExpiresIn);

    const token = getCobuyingAuthToken(
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

// ==================== 토큰 검증 관련 함수 ====================

export function extractPayload(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded as JwtPayload;
    } catch (error) {
        console.error('Token validation error:', error);
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
}

// ==================== Lambda 응답 관련 함수 ====================

/**
 * 임의의 body를 받아서 해당 값으로 JWT를 생성하고, LambdaReturnDto를 반환
 */
export function createAuthResponse<T>(statusCode: number, body: T, event: APIGatewayProxyEventV2, headers?: HeaderOptions, cookies?: CookieOptions): LambdaReturnDto {
    const jwt: AuthToken = createJwt(body);

    const refreshCookieOptions: CookieOptions = {
        SameSite: 'None',
        'Max-Age': 604800,
        Path: '/',
        cookies : {
            [TokenName.refreshToken] : jwt.refreshToken
        }
    };

    const headerOptions: HeaderOptions = {
        Authorization: `Bearer ${jwt.accessToken}`,
    };

    const lamdbdaReturnDto = new LambdaReturnDto(statusCode, body, event, headerOptions, refreshCookieOptions);
    return lamdbdaReturnDto;
}
