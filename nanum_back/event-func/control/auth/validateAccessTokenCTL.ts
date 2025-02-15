import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR, BaseHeader } from 'common/responseType';
import { validateAccessTokenSRV } from '@auth/validateAccessTokenSRV';

function validateInput(event: APIGatewayProxyEvent): string {
    let token;
    try {
        const bearerAuthorization = event.headers["Authorization"] || event.headers["x-amzn-Remapped-Authorization"];
        if (!bearerAuthorization) {
            throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
        }
        const token = bearerAuthorization.split(' ')[1];
        if (!token) {
            throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
        }
        return token;
    } catch (error) {
        throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
    }
}

export const validateAccessTokenCTL = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let token: string;
    try {
        token = validateInput(event);
    } catch (error) {
        throw error;
    }

    try {
        // 토큰 기반 사용자 인증
        const authToken = validateAccessTokenSRV(token, 'access');
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
