import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { queryCoBuyingById } from '@cobuying/queryCoBuyingOneDAO';
import { BaseHeader } from 'common/responseType';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';

const validateInput = (event: APIGatewayProxyEventV2): void => {
    const { ownerName, id } = event.queryStringParameters ?? {};
    if (!ownerName || !id) {
        throw Error('공구글 조회를 위한 필수 입력값이 없어요.');
    }
};

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * @param event
 * @returns
 */
export const getCoBuyingByIdHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    let ownerName;
    let id;

    try {
        validateInput(event);
        const params = event.queryStringParameters ?? {};
        ownerName = params.ownerName || '';
        id = params.id || '';
    } catch (error) {
        return new LambdaReturnDto(400, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
    try {
        console.log(' ownerName : ' + ownerName + '\n id : ' + id);
        const cobuying = await queryCoBuyingById(ownerName, id);
        return new LambdaReturnDto(200, cobuying, event).getLambdaReturnDto();
    } catch (error) {
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
};
