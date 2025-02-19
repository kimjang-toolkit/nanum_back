import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BaseHeader } from 'common/responseType';
import { CoBuyingDetail } from '@interface/cobuying';
import { queryCoBuyingDetail } from '@cobuying/queryCoBuyingDetailDAO';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';

const validateInput = (event: APIGatewayProxyEvent): void => {
    const coBuyingId = event.pathParameters?.coBuyingId;
    const ownerName = event.queryStringParameters?.ownerName;
    if (!ownerName || !coBuyingId) {
        throw Error('공구글 조회를 위한 필수 입력값이 없어요.');
    }
};

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * 
 * Get
 * {domain}/api/co-buying/detail?ownerName={ownerName}&coBuyingId={cobuyingId}
 * 
 * @param event
 * @returns
 */
export const getCoBuyingDetailHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let ownerName;
    let coBuyingId;

    try {
        validateInput(event);
        const params = event.queryStringParameters ?? {};
        ownerName = params.ownerName || '';
        coBuyingId = event.pathParameters?.coBuyingId || '';
    } catch (error) {
        return new LambdaReturnDto(400, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
    try {
        console.log(' ownerName : ' + ownerName + '\n coBuyingId : ' + coBuyingId);
        const cobuying: CoBuyingDetail = await queryCoBuyingDetail(ownerName, coBuyingId);
        return new LambdaReturnDto(200, cobuying, event).getLambdaReturnDto();
    } catch (error) {
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
};
