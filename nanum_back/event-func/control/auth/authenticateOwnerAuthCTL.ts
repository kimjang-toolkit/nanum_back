import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR, AuthSuccessHeader, BaseHeader } from 'common/responseType';
import { authenticateOwnerAuthSRV } from '@auth/authenticateOwnerAuthSRV';
import { CoBuyingOwnerAuth, CookieOptions, TokenName, UserAuthDto } from '@interface/auth';
const validateInput = (event: APIGatewayProxyEvent): CoBuyingOwnerAuth => {
    const coBuyingId = event.pathParameters?.coBuyingId;
    const { ownerName, ownerPassword } = JSON.parse(event.body || '');
    if (!ownerName || !ownerPassword || !coBuyingId) {
        throw Error('정확한 인증 정보를 전달해주세요.');
    }
    return {
        ownerName: ownerName,
        ownerPassword: ownerPassword,
        coBuyingId: coBuyingId,
    } as CoBuyingOwnerAuth;
};

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * @param event
 * @returns
 */
export const authenticateOwnerAuth = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let auth: CoBuyingOwnerAuth;
    try {
        auth = validateInput(event);
    } catch (error) {
        return {
            statusCode: 400,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
    try {
        // console.log('auth : ', auth);
        const jwt = await authenticateOwnerAuthSRV(auth);

        // httpOnly로 refreshToken을 쿠키에 setting
        const refreshCookieOptions: CookieOptions = {
            SameSite: 'None',
            'Max-Age': 604800,
            // Domain: 'gonggong99.store',
            Path: '/',
        };

        /**
         * 쿠키 설정
         * httpOnly로 설정하면 JS에서 쿠키를 접근할 수 없다? 
         */
        const setCookies = [
            `${TokenName.refreshToken}=${jwt.refreshToken}; HttpOnly; Secure; ${Object.entries(refreshCookieOptions)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ')}`,
        ];

        console.log(AuthSuccessHeader);

        const headers = {
            ...AuthSuccessHeader,
            'Set-Cookie': setCookies.join(', '),
            Authorization: `Bearer ${jwt.accessToken}`,
        };
        console.log('headers : ', headers);
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                ownerName: auth.ownerName,
                coBuyingId: auth.coBuyingId,
            } as UserAuthDto),
        };
    } catch (error) {
        if (error instanceof APIERROR) {
            return {
                statusCode: error.statusCode,
                headers: BaseHeader,
                body: JSON.stringify({ message: error.message }),
            };
        }
        return {
            statusCode: 500,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
};
