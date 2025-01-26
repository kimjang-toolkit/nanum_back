import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR, BaseHeader } from 'common/responseType';
import { authenticateOwnerAuthSRV } from '@auth/authenticateOwnerAuthSRV';
import { CoBuyingOwnerAuth } from '@interface/auth';
const validateInput = (event: APIGatewayProxyEvent): CoBuyingOwnerAuth => {
    const id = event.pathParameters?.id;
    const { ownerName, ownerPassword } = JSON.parse(event.body || '');
    if (!ownerName || !ownerPassword || !id) {
        throw Error('정확한 인증 정보를 전달해주세요.');
    }
    return {
        ownerName: ownerName,
        ownerPassword: ownerPassword,
        coBuyingId: id,
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
        console.log(' coBuyingId : ', auth.coBuyingId, ' ownerName : ', auth.ownerName);
        const jwt = await authenticateOwnerAuthSRV(auth);
        return {
            statusCode: 200,
            headers: BaseHeader,
            body: JSON.stringify(jwt),
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
