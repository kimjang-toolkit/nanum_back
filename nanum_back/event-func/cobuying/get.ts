import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryCoBuyingById } from './query';

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * @param event
 * @returns
 */
export const getCoBuyingHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const pathparams = event.pathParameters;

        if (pathparams === null || !pathparams.ownerName || !pathparams.createdAt || !pathparams.id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: '찾고자하는 공구글을 입력해주세요.',
                }),
            };
        }

        console.log('id : ' + pathparams.id + ' ownerName : ' + pathparams.ownerName);
        const cobuying = await queryCoBuyingById(pathparams.ownerName, pathparams.createdAt, pathparams.id);

        return {
            statusCode: 200,
            body: JSON.stringify(cobuying),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: '공구 조회 중 오류가 발생했습니다.',
            }),
        };
    }
};
