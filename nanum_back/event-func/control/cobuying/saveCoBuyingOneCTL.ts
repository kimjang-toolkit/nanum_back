import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { saveCoBuying } from '@cobuying/saveCoBuyingOneSRV';
import { BaseHeader } from 'common/responseType';
import { CoBuyingCreateReq, CoBuyingSummary } from '@interface/cobuying';
import { DivideType } from '@domain/cobuying';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';

const validateCoBuyingReq = (event: APIGatewayProxyEventV2): void => {
    if (!event.body) {
        throw new Error('요청 본문이 비어있습니다.');
    }
    const input = JSON.parse(event.body);
    if (!input.productName) {
        throw new Error('필수 필드가 누락되었습니다.');
    }
};

export const createCoBuyingHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    let input: CoBuyingCreateReq<DivideType>;
    try {
        validateCoBuyingReq(event);
        input = JSON.parse(event.body || '');
    } catch (error) {
        return new LambdaReturnDto(400, { message: (error as Error).message }, event).getLambdaReturnDto();
    }

    try {
        const item : CoBuyingSummary = await saveCoBuying(input);
        return new LambdaReturnDto(201, item, event).getLambdaReturnDto();
    } catch (err) {
        console.error(err);
        return new LambdaReturnDto(500, { message: (err as Error).message }, event).getLambdaReturnDto();
    }
};
