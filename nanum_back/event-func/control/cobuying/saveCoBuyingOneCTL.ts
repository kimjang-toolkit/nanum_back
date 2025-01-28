import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { saveCoBuying } from '@cobuying/saveCoBuyingOneSRV';
import { BaseHeader } from 'common/responseType';
import { CoBuyingCreateReq } from '@interface/cobuying';
import { DivideType } from '@domain/cobuying';

const validateCoBuyingReq = (event: APIGatewayProxyEvent): void => {
    if (!event.body) {
        throw new Error('요청 본문이 비어있습니다.');
    }
    const input = JSON.parse(event.body);
    if (!input.productName) {
        throw new Error('필수 필드가 누락되었습니다.');
    }
};

export const createCoBuyingHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let input: CoBuyingCreateReq<DivideType>;
    try {
        validateCoBuyingReq(event);
        input = JSON.parse(event.body || '');
    } catch (error) {
        return {
            statusCode: 400,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
    try {
        const item = await saveCoBuying(input);

        return {
            statusCode: 201,
            headers: BaseHeader,
            body: JSON.stringify(item),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            headers: BaseHeader,
            body: JSON.stringify({
                message: (err as Error).message,
            }),
        };
    }
};
