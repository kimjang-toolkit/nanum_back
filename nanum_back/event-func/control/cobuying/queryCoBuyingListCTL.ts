import { CoBuyingQueryParams } from '@interface/cobuyingList';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BaseHeader } from 'common/responseType';
import { queryCoBuyingListSRV } from 'service/cobuying/queryCoBuyingListSRV';

function validInput(input: APIGatewayProxyEvent) {
    if (!input.body) {
        throw new Error('조회 조건을 알려주세요,');
    }
    const params: CoBuyingQueryParams = JSON.parse(input.body);

    if (!params.sort || !params.sort.sortCriteria) {
        throw new Error('정렬 조건을 알려주세요,');
    }

    // 이전 조회 값이 있으면서 그 기준이 정렬 기준과 다르다면 다시 조회를 부탁하기
    if (params.lastEvaluatedKey) {
        const key = params.lastEvaluatedKey.key;
        const sortCriteria = params.sort.sortCriteria;
        // 정렬 조건과 이전 조회 기준 값이 다른 경우 예외 처리
        if (key !== sortCriteria) {
            throw new Error('정렬 조건과 이전 조회 값을 다시 확인해주세요.');
        }
    }
}

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
    let input: CoBuyingQueryParams;
    try {
        validInput(event);
        input = JSON.parse(event.body || '');
        console.log(input);
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: (error as Error).message,
            }),
        };
    }

    try {
        const res = await queryCoBuyingListSRV(input);

        return {
            statusCode: 200,
            headers: BaseHeader,
            body: JSON.stringify(res),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: (error as Error).message,
            }),
        };
    }
};
