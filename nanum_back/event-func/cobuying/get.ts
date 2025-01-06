import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryCoBuyingById } from './query';

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * @param event
 * @returns
 */
export const getCoBuyingByIdHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { ownerName, createdAt, id } = event.queryStringParameters ?? {};

        if (!ownerName || !createdAt || !id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: '찾고자하는 공구글을 입력해주세요.',
                }),
            };
        }

        console.log(' ownerName : ' + ownerName + '\n createdAt : ' + createdAt + '\n id : ' + id);
        const cobuying = await queryCoBuyingById(ownerName, createdAt, id);

        return {
            statusCode: 200,
            body: JSON.stringify(cobuying),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err,
            }),
        };
    }
};
