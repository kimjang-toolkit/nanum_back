import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthToken, TokenName } from '@interface/auth';
import { APIERROR, BaseHeader } from 'common/responseType';
import { refreshAuthenticate } from '@auth/refreshAuthenticateSRV';

function validateInput(event: APIGatewayProxyEvent): AuthToken {
    let refreshToken: string;
    let accessToken: string;
    try {
        // event에서 headers를 추출하여 토큰 검증
        const headers = event.headers;
        refreshToken = headers[TokenName.refreshToken] || '';
        accessToken = headers[TokenName.accessToken] || '';
    } catch (error) {
        throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
    }
    if (refreshToken === '' || accessToken === '') {
        throw new APIERROR(403, '정확한 인증 정보를 전달해주세요.');
    }

    return { accessToken: accessToken, refreshToken: refreshToken } as AuthToken;
}

export const authenticateOwnerAuth = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let token: AuthToken;
    try {
        token = validateInput(event);
    } catch (error) {
        throw error;
    }

    try {
        const authToken = refreshAuthenticate(token);
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
