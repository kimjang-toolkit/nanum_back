import { CreatedAtKey } from '@interface/cobuying';
import { CoBuyingQueryParams } from '@interface/cobuyingList';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BaseHeader } from 'common/responseType';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';
import { queryCoBuyingListSRV } from 'service/cobuying/queryCoBuyingListSRV';

/**
 *
 * Post ->
 * 정렬 기준 : 생성일자순[내림차순] | 마감순[오름차순]
 * 정렬 순서 : 오름차순, 내림차순
 * 필터 조건 : 공구상태, 공구장이름, 생성일자, 마감일자
 *
 * @param event
 * @returns
 */
export const getCoBuyingListHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const input: CoBuyingQueryParams = {};
    try {
        // validInput(event);
        // input = JSON.parse(event.body || '');
        const params = event.queryStringParameters ?? {};
        const createdAtId = params.createdAtId || '';
        const ownerName = params.ownerName || '';
        const deletedYN = params.deletedYN || 'N';
        const id = createdAtId.split('#')[1];

        if (ownerName && createdAtId) {
            const key: CreatedAtKey = {
                id: id,
                deletedYN: deletedYN,
                createdAtId: createdAtId,
                ownerName: ownerName,
            };
            input['lastEvaluatedKey'] = key;
        }

        input['sort'] = {
            sortCriteria: 'createdAtId',
            sortingOrder: 'desc',
        };

        input['size'] = 10;

        console.log('input : ', input);
    } catch (error) {
        console.error(error);
        // return {
        //     statusCode: 500,
        //     headers: BaseHeader,
        //     body: JSON.stringify({
        //         message: (error as Error).message,
        //     }),
        // };
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
    try {
        const res = await queryCoBuyingListSRV(input);
        
        // return {
        //     statusCode: 200,
        //     headers: BaseHeader,
        //     body: JSON.stringify(res),
        // };
        return new LambdaReturnDto(200, res, event).getLambdaReturnDto();
    } catch (error) {
        console.log(error);
        // return {
        //     statusCode: 500,
        //     headers: {
        //         'Access-Control-Allow-Headers': 'Content-Type',
        //         'Access-Control-Allow-Origin': '*', // Allow from anywhere
        //         'Access-Control-Allow-Methods': 'GET', // Allow only GET request
        //     },
        //     body: JSON.stringify({
        //         message: (error as Error).message,
        //     }),
        // };
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
};
