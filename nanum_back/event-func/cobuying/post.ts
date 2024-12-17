import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CoBuyingCreateRes, CoBuyingCreateReq } from './types';
import { CoBuyingStatus } from './cobuyingStatus';

const validateCoBuyingReq = (input: CoBuyingCreateReq): void => {
    if (!input.productName) {
        throw new Error('필수 필드가 누락되었습니다.');
    }
};

/**
 * DB에 공구글 데이터 생성
 *
 * @param input 공구글 생성 입력 데이터
 * @returns 공구글 생성 출력 데이터
 */
const createCoBuyingItem = async (input: CoBuyingCreateReq): Promise<CoBuyingCreateRes> => {
    const dynamodb = new DynamoDB.DocumentClient();
    const timestamp = new Date().toISOString();

    const item = {
        id: uuidv4(),
        createdAt: timestamp,
        status: CoBuyingStatus.PREPARING,
        ...input,
    };

    // await dynamodb
    //     .put({
    //         TableName: 'cobuying',
    //         Item: item,
    //     })
    //     .promise();

    const outputItem: CoBuyingCreateRes = {
        id: item.id,
        productName: item.productName,
        ownerName: item.ownerName,
        deadline: item.deadline,
        createdAt: item.createdAt,
    };

    return outputItem;
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

        const item = await createCoBuyingItem(input);
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
