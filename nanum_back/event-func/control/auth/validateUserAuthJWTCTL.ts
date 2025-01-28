import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthToken } from '@interface/auth';
import { APIERROR, BaseHeader } from 'common/responseType';
import { validateUserAuthJWT } from 'service/auth/validateUserAuthJWTSRV';

function validateInput(event: APIGatewayProxyEvent): AuthToken {
    let token: AuthToken;
    try {
        token = JSON.parse(event.body || '');
    } catch (error) {
        throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
    }
    if (token.refreshToken === undefined || token.refreshTokenExpiresIn === undefined) {
        throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
    }
    if (token.user) {
        throw new APIERROR(401, '유저 정보가 옳바르지 않습니다. 다시 로그인해주세요.');
    }

    return token;
}

export const validateUserAuthJWTCTL = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let token: AuthToken;
    try {
        token = validateInput(event);
    } catch (error) {
        throw error;
    }

    try {
        // 토큰 기반 사용자 인증
        const authToken = validateUserAuthJWT(token, 'access');
        return {
            statusCode: 200,
            headers: BaseHeader,
            body: JSON.stringify(authToken),
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
