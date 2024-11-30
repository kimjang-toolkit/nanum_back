import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

// 로컬 DynamoDB 연결 설정
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'ap-northeast-2',
    endpoint: 'http://host.docker.internal:8000',
});
const TABLE_NAME = 'PersonTable';

export const getPersonHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id; // Retrieving 'name' from URL path parameters
        console.log('find id : ', id);
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Name parameter is required' }),
            };
        }
        const params = {
            TableName: TABLE_NAME,
            Key: { Id: id },
        };
        // Query DynamoDB table for items matching the 'Name'
        const data = await dynamoDB.get(params).promise();

        // Check if data was returned and respond accordingly
        if (data) {
            console.log('Success', data);
            return {
                statusCode: 201,
                body: JSON.stringify({
                    message: 'Item successfully searched',
                    item: data.Item,
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
        console.error('Error retrieving from DynamoDB:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve items' }),
        };
    }
};
