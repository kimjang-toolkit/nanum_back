import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CoBuyingCreateReq } from '@api-interface/cobuying';
import { saveCoBuying } from './dao';

const validateCoBuyingReq = (input: CoBuyingCreateReq): void => {
    if (!input.productName) {
        throw new Error('필수 필드가 누락되었습니다.');
    }
};

export const createCoBuyingHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: '요청 본문이 비어있습니다.' }),
            };
        }

        const input: CoBuyingCreateReq = JSON.parse(event.body);
        console.log('input : ', input);
        try {
            validateCoBuyingReq(input);
        } catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: (error as Error).message }),
            };
        }

        const item = await saveCoBuying(input);
        console.log('item ', item);
        return {
            statusCode: 201,
            body: JSON.stringify(item),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: '공구 생성 중 오류가 발생했습니다.',
            }),
        };
    }
};
