import { CoBuyingPost, CoBuyingSimple } from '@api-interface/cobuying';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { mapToCoBuyingPost } from 'common/mapToCoBuyingPost';

const client = new DynamoDBClient({
    endpoint: {
        hostname: process.env.DYNAMODBHOST || 'dynamodb.ap-northeast-2.amazonaws.com',
        path: '',
        protocol: process.env.PROTOCAL || 'https:',
    },
    region: process.env.REGIONNAME,
});

const ddbDocClient = DynamoDBDocument.from(client);

export const queryCoBuyingById = async (
    ownerName: string,
    createdAtDateOnly: string,
    id: string,
): Promise<CoBuyingSimple> => {
    // DynamoDB에서 'id'로 공구글 조회
    // 단건 조회를 위한 파라미터 설정
    // 불변값으로 조희

    const createdAtId = createdAtDateOnly + '#' + id;
    // console.log('ownerName : ', ownerName);
    // console.log('createdAt : ', createdAtId);
    // console.log(createdAtId === '2025-01-07#3e3ad1dd-3ef0-4a50-8e77-d3344bc4da98');

    const params = {
        TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        IndexName: 'OwnerNameGSI', // 사용할 GSI
        KeyConditionExpression: 'ownerName = :ownerName AND createdAtId = :createdAtId', // 쿼리 조건
        ExpressionAttributeValues: {
            ':ownerName': { S: ownerName }, // GSI 파티션 키 값
            ':createdAtId': { S: createdAtId }, // GSI 정렬 키 값
        },
    };

    try {
        // DynamoDB에서 해당 id에 해당하는 공구글을 조회
        // 단건 조회를 위한 GetCommand 실행
        const command = new QueryCommand(params);
        const result = await ddbDocClient.send(command);

        // 조회 결과가 없다면, 공구글을 찾을 수 없다는 에러를 던짐
        if (result.Items && result.Items.length > 0) {
            console.log(result.Items[0]);
            const cobuying = mapToCoBuyingPost(result.Items[0]) as CoBuyingPost;
            // CoBuyingSimple 인터페이스에 맞게 데이터를 매핑하여 반환
            return {
                id: cobuying.id,
                productName: cobuying.productName,
                ownerName: cobuying.ownerName,
                totalPrice: cobuying.totalPrice,
                attendeeCount: cobuying.attendeeCount,
                deadline: cobuying.deadline,
                status: cobuying.coBuyingStatus,
                createdAt: cobuying.createdAtDateOnly,
            } as CoBuyingSimple;
            // 필요한 추가 로직
        } else {
            throw new Error('찾으시는 공구글이 존재하지 않아요');
        }
        // 조회된 공구글 사용
        // console.log('조회된 공구글:', cobuying);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw new Error(error.message);
        }
        throw new Error('DB 조회 중 문제가 발생했습니다. ');
    }
};
