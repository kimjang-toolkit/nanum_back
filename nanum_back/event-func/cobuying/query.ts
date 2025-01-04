import { CoBuyingSimple, CoBuyingPost, QuantityCoBuying, AttendeeCoBuying } from '@api-interface/cobuying';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommand, PutCommand, PutCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    endpoint: {
        hostname: process.env.DYNAMODBHOST || 'dynamodb.ap-northeast-2.amazonaws.com',
        port: Number(process.env.DYNAMODBPORT) || 3300,
        path: '',
        protocol: process.env.PROTOCAL || 'https:',
    },
    region: process.env.REGIONNAME,
});

const ddbDocClient = DynamoDBDocument.from(client);

// const dynamoDB = new AWS.DynamoDB.DocumentClient({
//     endpoint: new AWS.Endpoint(process.env.DYNAMODBURL || 'https://dynamodb.ap-northeast-2.amazonaws.com'), // process.env.DYNAMO_DB_URL || 'http://localhost:3300', // 로컬 DynamoDB URL (환경 변수로 설정)
//     region: process.env.REGION, // DynamoDB 리전 설정 (필요시 수정)
// });

// const dynamoDBLowLevel = new AWS.DynamoDB({
//     endpoint: new AWS.Endpoint(process.env.DYNAMODBURL || 'https://dynamodb.ap-northeast-2.amazonaws.com'), // process.env.DYNAMO_DB_URL, // 로컬 DynamoDB URL (환경 변수로 설정)
//     region: process.env.REGION, // DynamoDB 리전 설정 (필요시 수정)
// }); // 저수준 API 사용

export const insertCoBuying = async (cobuying: CoBuyingPost): Promise<CoBuyingSimple> => {
    // console.log('조회 테이블 : ' + process.env.CoBuyingTableName);
    // console.log('조회 테이블 URL : ' + process.env.DYNAMODBURL);
    await ddbDocClient.send(new ListTablesCommand({}));
    // console.log('테이블 조회 결과 : ' + result);

    // DynamoDB에 삽입할 데이터 맵핑
    const params: PutCommandInput = {
        TableName: process.env.CoBuyingTableName || 'CoBuyingTable', // 환경 변수로 테이블 이름 지정
        Item: {
            ...cobuying,
            // id: cobuying.id, // 공구글 고유 ID
            // productName: cobuying.productName, // 상품 이름
            // productLink: cobuying.productLink || null, // 상품 링크 (선택적, null 허용)
            // ownerName: cobuying.ownerName, // 공구장 이름
            // totalPrice: cobuying.totalPrice, // 공구 상품 총액
            // attendeeCount: cobuying.attendeeCount, // 신청자 수 (공구장 포함)
            // deadline: cobuying.deadline, // 신청 마감일
            // memo: cobuying.memo || null, // 메모 (선택적)
            // attendeeList: cobuying.attendeeList || [], // 신청자 리스트 (빈 배열 기본값)
            // createdAt: cobuying.createdAt, // 생성일 (ISO 형식)
            // createdAtDateOnly: cobuying.createdAtDateOnly,
            // status: cobuying.status, // 공구글 상태 (예: 'PREPARING')
            // 수량나눔에만 해당하는 필드
            // totalQuantity: cobuying.type === 'quantity' ? cobuying.totalQuantity : undefined,
            // ownerQuantity: cobuying.type === 'quantity' ? cobuying.ownerQuantity : undefined,
            // ownerPrice: cobuying.type === 'quantity' ? cobuying.ownerPrice : undefined,
            // totalAttendeePrice: cobuying.type === 'quantity' ? cobuying.totalAttendeePrice : undefined,
            // totalAttendeeQuantity: cobuying.type === 'quantity' ? cobuying.totalAttendeeQuantity : undefined,
            // unitPrice: cobuying.type === 'quantity' ? cobuying.unitPrice : undefined,
            // // 인원나눔에만 해당하는 필드
            // planAttendeeCount: cobuying.type === 'attendee' ? cobuying.planAttendeeCount : undefined,
            // perAttendeePrice: cobuying.type === 'attendee' ? cobuying.perAttendeePrice : undefined,
        },
    };

    // DynamoDB에 데이터를 삽입
    try {
        const command = new PutCommand(params);
        await ddbDocClient.send(command);

        return {
            id: cobuying.id,
            productName: cobuying.productName,
            ownerName: cobuying.ownerName,
            totalPrice: cobuying.totalPrice,
            attendeeCount: cobuying.attendeeCount,
            deadline: cobuying.deadline,
            status: cobuying.status,
            createdAt: cobuying.createdAt, // 생성일 (ISO 형식)
            createdAtDateOnly: cobuying.createdAtDateOnly,
            memo: cobuying.memo || null,
            attendeeList: cobuying.attendeeList || [],
        } as CoBuyingSimple; // 성공적으로 삽입한 후, CoBuyingSimple 타입으로 반환
    } catch (error) {
        console.error('DynamoDB 삽입 중 오류 발생:', error);
        throw new Error('공구글 저장에 실패했습니다.');
    }
};

export const queryCoBuyingById = async (id: string, createdAtDateOnly: string): Promise<CoBuyingSimple> => {
    // DynamoDB에서 'id'로 공구글 조회
    // 단건 조회를 위한 파라미터 설정
    const params = {
        TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        Key: {
            createdAtDateOnly: createdAtDateOnly, // 파티션키로 사용될 날짜 (예: '2025-01-04')
            id: id, // 조회할 id
        },
    };

    try {
        // DynamoDB에서 해당 id에 해당하는 공구글을 조회
        // 단건 조회를 위한 GetCommand 실행
        const command = new GetCommand(params);
        const result = await ddbDocClient.send(command);

        // 조회 결과가 없다면, 공구글을 찾을 수 없다는 에러를 던짐
        if (!result.Item) {
            throw new Error('찾으시는 공구글이 존재하지 않아요');
        }
        // 조회된 공구글 데이터를 CoBuyingPost 인터페이스로 매핑
        const cobuying = mapToCoBuyingPost(result.Item) as CoBuyingPost;

        // 조회된 공구글 사용
        // console.log('조회된 공구글:', cobuying);

        // CoBuyingSimple 인터페이스에 맞게 데이터를 매핑하여 반환
        return {
            id: cobuying.id,
            productName: cobuying.productName,
            ownerName: cobuying.ownerName,
            totalPrice: cobuying.totalPrice,
            attendeeCount: cobuying.attendeeCount,
            deadline: cobuying.deadline,
            status: cobuying.status,
            createdAt: cobuying.createdAtDateOnly,
            memo: cobuying.memo || null,
            attendeeList: cobuying.attendeeList || [],
        } as CoBuyingSimple;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error);
        }
        throw new Error('DB 조회 중 문제가 발생했습니다. ');
    }
};

// 공구글에 맞는 타입으로 매핑하기
const mapToCoBuyingPost = (item: Record<string, any>): CoBuyingPost => {
    if (!item || typeof item !== 'object') {
        throw new Error('유효하지 않은 데이터입니다.');
    }

    // type 필드가 존재하지 않거나 알 수 없는 값인 경우 예외 처리
    if (!item.type) {
        throw new Error('공구글 타입이 존재하지 않습니다.');
    }

    // 공구글 타입에 따라 필드를 확인하여 적절한 타입으로 변환
    if (item.type === 'quantity') {
        return item as QuantityCoBuying;
    }

    if (item.type === 'attendee') {
        return item as AttendeeCoBuying;
    }

    // 유효하지 않은 type일 경우 에러 처리
    throw new Error(`알 수 없는 공구글 타입입니다: ${item.type}`);
};
