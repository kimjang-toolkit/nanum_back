import { CreatedAtKey } from '@interface/cobuying';
import { CoBuyingQueryParams } from '@interface/cobuyingList';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BaseHeader } from 'common/responseType';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';
import { queryCoBuyingListSRV } from 'service/cobuying/queryCoBuyingListSRV';

/**
 *
 * {domain}/api/co-buying/page?createdAtId={createdAtId}&ownerName={ownerName}
 * 
 * @param event
 * @returns
 */
export const getCoBuyingListHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const input: CoBuyingQueryParams = {};
    console.log('event : ', event);
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
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
    try {
        const res = await queryCoBuyingListSRV(input);
        return new LambdaReturnDto(200, res, event).getLambdaReturnDto();
    } catch (error) {
        console.log(error);
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
};
