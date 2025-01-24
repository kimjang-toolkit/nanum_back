import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BaseHeader } from 'common/responseType';
import { CoBuyingDetail } from '@interface/cobuying';
import { queryCoBuyingDetail } from '@cobuying/queryCoBuyingDetailDAO';

const validateInput = (event: APIGatewayProxyEvent): void => {
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
export const getCoBuyingDetailHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let ownerName;
    let id;

    try {
        validateInput(event);
        const params = event.queryStringParameters ?? {};
        ownerName = params.ownerName || '';
        id = params.id || '';
    } catch (error) {
        return {
            statusCode: 400,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
    try {
        console.log(' ownerName : ' + ownerName + '\n id : ' + id);
        const cobuying: CoBuyingDetail = await queryCoBuyingDetail(ownerName, id);

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
