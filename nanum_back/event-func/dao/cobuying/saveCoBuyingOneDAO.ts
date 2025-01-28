import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { CoBuyingPost } from '@domain/cobuying';
import { CoBuyingSummary } from '@interface/cobuying';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';

const ddbDocClient = createDynamoDBDocClient();

export const insertCoBuying = async (cobuying: CoBuyingPost): Promise<CoBuyingSummary> => {
    console.log('조회 테이블 : ' + process.env.CoBuyingTableName);
    console.log('조회 테이블 URL : ' + process.env.DYNAMODBURL);

    // DynamoDB에 삽입할 데이터 맵핑
    const params: PutCommandInput = {
        TableName: process.env.CoBuyingTableName || 'CoBuyingTable', // 환경 변수로 테이블 이름 지정
        Item: {
            ...cobuying,
        },
    };

    // DynamoDB에 데이터를 삽입
    try {
        const command = new PutCommand(params);
        const result = await ddbDocClient.send(command);
        console.log(result);
        if (result.$metadata.httpStatusCode == 200)
            return {
                id: cobuying.id,
                productName: cobuying.productName,
                ownerName: cobuying.ownerName,
                totalPrice: cobuying.totalPrice,
                attendeeCount: cobuying.attendeeCount,
                deadline: cobuying.deadline,
                coBuyingStatus: cobuying.coBuyingStatus,
                createdAt: cobuying.createdAt,
                type: cobuying.type,
            } as CoBuyingSummary;
        else {
            const errorMessage = `DynamoDB 삽입 오류: 상태 코드 ${
                result.$metadata.httpStatusCode
            }, 요청 결과: ${JSON.stringify(result)}`;
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('DynamoDB 삽입 중 오류 발생:', error);

        if (error instanceof Error) {
            if (error.name === 'ValidationException') {
                throw new Error('데이터 형식이 잘못되었습니다. 입력값을 확인하세요.');
            } else if (error.name === 'ProvisionedThroughputExceededException') {
                throw new Error('DynamoDB 읽기/쓰기 용량이 초과되었습니다. 나중에 다시 시도해주세요.');
            } else if (error.name === 'ConditionalCheckFailedException') {
                throw new Error('조건을 만족하는 항목이 없습니다.');
            } else if (error.name === 'ResourceNotFoundException') {
                throw new Error('지정된 DynamoDB 테이블을 찾을 수 없습니다.');
            } else if (error.name === 'InternalServerError') {
                throw new Error('DynamoDB 내부 서버 오류가 발생했습니다.');
            } else {
                throw new Error(`알 수 없는 오류 발생: ${error.message}`);
            }
        }

        throw new Error('공구글 저장에 실패했습니다. 오류를 확인해주세요.');
    }
};
