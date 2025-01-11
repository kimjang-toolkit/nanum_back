import {
    CoBuyingSimple,
    CoBuyingPost,
    QuantityCoBuying,
    AttendeeCoBuying,
    BaseCoBuying,
    CoBuyingStatus,
} from '@api-interface/cobuying';
import { Attendee } from '@api-interface/user';
import { DynamoDBClient, ListTablesCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommand, PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';

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
    console.log('조회 테이블 : ' + process.env.CoBuyingTableName);
    console.log('조회 테이블 URL : ' + process.env.DYNAMODBURL);
    // console.log('입력 Item : ', cobuying);
    // await ddbDocClient.send(new ListTablesCommand({}));
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
        const result = await ddbDocClient.send(command);
        console.log(result.Attributes);
        return {
            id: cobuying.id,
            productName: cobuying.productName,
            ownerName: cobuying.ownerName,
            totalPrice: cobuying.totalPrice,
            attendeeCount: cobuying.attendeeCount,
            deadline: cobuying.deadline,
            coBuyingStatus: cobuying.coBuyingStatus,
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

// export const queryCoBuyingWithPage = async (size: number, offset: number): Promise<CoBuyingSimple> => {
//     const params = {
//         TableName: process.env.CoBuyingTableName || '',
//     };
//     const command = new QueryCommand(params);
//     const result = await ddbDocClient.send(command);

//     // 조회 결과가 없다면, 공구글을 찾을 수 없다는 에러를 던짐
//     if (!result.Items) {
//         throw new Error('찾으시는 공구글이 존재하지 않아요');
//     }
// };

export const queryCoBuyingById = async (
    ownerName: string,
    createdAtDateOnly: string,
    id: string,
): Promise<CoBuyingSimple> => {
    // DynamoDB에서 'id'로 공구글 조회
    // 단건 조회를 위한 파라미터 설정
    // 불변값으로 조희

    const createdAtId = createdAtDateOnly + '#' + id;
    console.log('ownerName : ', ownerName);
    console.log('createdAt : ', createdAtId);
    console.log(createdAtId === '2025-01-07#3e3ad1dd-3ef0-4a50-8e77-d3344bc4da98');

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
                memo: cobuying.memo || null,
                attendeeList: cobuying.attendeeList || [],
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

// 공구글에 맞는 타입으로 매핑하기
const mapToCoBuyingPost = (item: Record<string, Record<string, any>>): CoBuyingPost => {
    if (!item || typeof item !== 'object') {
        throw new Error('유효하지 않은 데이터입니다.');
    }

    // 공구 타입에 따라 매핑할 인터페이스를 구분합니다.
    const baseCoBuying: BaseCoBuying = {
        createdAtId: item.createdAtId.S,
        deadlineId: item.deadlineId.S,
        ownerNameId: item.ownerNameId.S,
        id: item.id.S,
        productName: item.productName.S,
        productLink: item.productLink?.S,
        ownerName: item.ownerName.S,
        ownerPassword: item.ownerPwd?.S,
        totalPrice: Number(item.totalPrice.N),
        attendeeCount: Number(item.attendeeCount.N),
        deadline: item.deadline.S,
        type: item.type.S === 'quantity' ? 'quantity' : 'attendee',
        memo: item.memo?.S,
        attendeeList: mapAttendeeList(item.attendeeList.L),
        createdAt: item.createdAt.S,
        createdAtDateOnly: item.createdAtDateOnly.S,
        coBuyingStatus: Number(item.coBuyingStatus.N) as CoBuyingStatus,
    };

    if (baseCoBuying.type === 'quantity') {
        const quantityCoBuying: QuantityCoBuying = {
            ...baseCoBuying,
            type: 'quantity',
            totalQuantity: Number(item.totalQuantity.N),
            ownerQuantity: Number(item.ownerQuantity.N),
            ownerPrice: Number(item.ownerPrice.N),
            totalAttendeePrice: Number(item.totalAttendeePrice.N),
            totalAttendeeQuantity: Number(item.totalAttendeeQuantity.N),
            unitPrice: Number(item.unitPrice.N),
        };

        return quantityCoBuying;
    } else {
        const attendeeCoBuying: AttendeeCoBuying = {
            ...baseCoBuying,
            type: 'attendee',
            planAttendeeCount: Number(item.totalAttendeeQuantity.N), // 예시로 총 참석자 수를 사용
            perAttendeePrice: Number(item.unitPrice.N), // 예시로 단가를 사용
        };

        return attendeeCoBuying;
    }

    // 유효하지 않은 type일 경우 에러 처리
    throw new Error(`알 수 없는 공구글 타입입니다: ${item.type}`);
};

// 신청자 리스트를 매핑하는 함수
function mapAttendeeList(attendeeList: any[]): Attendee[] {
    return attendeeList.map((attendee) => ({
        attendeeName: attendee.M.attendeeName.S,
        attendeePrice: Number(attendee.M.attendeePrice.N),
        appliedQuantity: Number(attendee.M.appliedQuantity.N),
    }));
}
