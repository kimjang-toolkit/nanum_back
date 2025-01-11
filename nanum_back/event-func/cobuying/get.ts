import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryCoBuyingById } from './query';
import { CoBuyingQueryParams } from '@api-interface/cobuying';

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * @param event
 * @returns
 */
export const getCoBuyingByIdHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { ownerName, createdAt, id } = event.queryStringParameters ?? {};

        if (!ownerName || !createdAt || !id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: '찾고자하는 공구글을 입력해주세요.',
                }),
            };
        }

        console.log(' ownerName : ' + ownerName + '\n createdAt : ' + createdAt + '\n id : ' + id);
        const cobuying = await queryCoBuyingById(ownerName, createdAt, id);

        return {
            statusCode: 200,
            body: JSON.stringify(cobuying),
        };
    } catch (err) {
        if (err instanceof Error && err.message == '찾으시는 공구글이 존재하지 않아요') {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: err.message,
                }),
            };
        }
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err,
            }),
        };
    }
};

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
    try {
        // 본문 확인
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: '요청 본문이 비어있습니다.' }),
            };
        }

        const input: CoBuyingQueryParams = JSON.parse(event.body);
        if (!input.sort || !input.sort.sortCriteria) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: '조회를 위한 정렬기준을 알려주세요.' }),
            };
        }

        return {
            statusCode: 200,
            body: '',
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err,
            }),
        };
    }
};
