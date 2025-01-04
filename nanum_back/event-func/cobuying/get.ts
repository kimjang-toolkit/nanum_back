import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryCoBuyingById } from './query';

export const getCoBuyingByIdHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const pathparams = event.pathParameters;

        if (pathparams === null || !pathparams.id || !pathparams.createdAt) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: '찾고자하는 공구글을 입력해주세요.',
                }),
            };
        }

        console.log('id : ' + pathparams.id);
        const cobuying = await queryCoBuyingById(pathparams.id, pathparams.createdAt);

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
