import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryCoBuyingById } from '@cobuying/queryCoBuyingOneDAO';
import { BaseHeader } from 'common/responseType';

const validateInput = (event: APIGatewayProxyEvent): void => {
    const { ownerName, createdAt, id } = event.queryStringParameters ?? {};
    if (!ownerName || !createdAt || !id) {
        throw Error('공구글 조회를 위한 필수 입력값이 없어요.');
    }
};

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * @param event
 * @returns
 */
export const getCoBuyingByIdHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let ownerName;
    let createdAt;
    let id;

    try {
        validateInput(event);
        const params = event.queryStringParameters ?? {};
        ownerName = params.ownerName || '';
        createdAt = params.createdAt || '';
        id = params.id || '';
    } catch (error) {
        return {
            statusCode: 400,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
    try {
        console.log(' ownerName : ' + ownerName + '\n createdAt : ' + createdAt + '\n id : ' + id);
        const cobuying = await queryCoBuyingById(ownerName, createdAt, id);

        return {
            statusCode: 200,
            headers: BaseHeader,
            body: JSON.stringify(cobuying),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
};
