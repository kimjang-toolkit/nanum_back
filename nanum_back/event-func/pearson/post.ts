import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

// 로컬 DynamoDB 연결 설정
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'ap-northeast-2',
    endpoint: 'http://host.docker.internal:8000',
});

const TABLE_NAME = 'PersonTable';

export const postTestHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received body:', event.body); // 요청 본문 확인
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid request, no body found' }),
            };
        }

        const { Id, Name, Age } = JSON.parse(event.body);

        // Input validation
        if (!Id || !Name || !Age) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Id, Name, and Age are required' }),
            };
        }
        const pearson = { Id, Name, Age };
        console.log('Insert pearson : ', pearson);
        const params = {
            TableName: TABLE_NAME,
            Item: pearson,
        };

        // Insert into DynamoDB and await the promise
        const data = await dynamoDB.put(params).promise();

        // Check if data was returned and respond accordingly
        if (data) {
            console.log('Success', data);
            return {
                statusCode: 201,
                body: JSON.stringify({
                    message: 'Item successfully inserted',
                    item: pearson,
                }),
            };
        } else {
            // If no data was returned, send an error
            console.error('Error: No response from DynamoDB');
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to insert item' }),
            };
        }
    } catch (err) {
        console.error('Error inserting into DynamoDB:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to insert item' }),
        };
    }
};
