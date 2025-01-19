import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

// DynamoDB 클라이언트를 생성하는 팩토리 함수
export const createDynamoDBDocClient = (): DynamoDBDocument => {
    // DynamoDBClient의 설정을 환경 변수로부터 동적으로 가져옵니다.
    const client = new DynamoDBClient({
        endpoint: {
            hostname: process.env.DYNAMODBHOST || 'dynamodb.ap-northeast-2.amazonaws.com', // 기본 호스트명
            path: '', // DynamoDB의 경로는 기본적으로 비어 있습니다.
            protocol: process.env.DB_PROTOCAL || 'http:', // https 프로토콜 사용
        },
        region: process.env.REGIONNAME, // 지역은 환경 변수에서 가져옵니다.
    });

    console.log('host:', process.env.DYNAMODBHOST);
    console.log('protocol:', process.env.DB_PROTOCAL);
    // DynamoDBDocument 객체 생성
    return DynamoDBDocument.from(client);
};
