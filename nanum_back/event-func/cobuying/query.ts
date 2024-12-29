import AWS from 'aws-sdk';
import { CoBuyingSimple, CoBuyingPost } from '@api-interface/cobuying';

const dynamoDB = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMO_DB_URL, // 로컬 DynamoDB URL (환경 변수로 설정)
    region: process.env.REGION, // DynamoDB 리전 설정 (필요시 수정)
});

const dynamoDBLowLevel = new AWS.DynamoDB({
    endpoint: process.env.DYNAMO_DB_URL, // 로컬 DynamoDB URL (환경 변수로 설정)
    region: process.env.REGION, // DynamoDB 리전 설정 (필요시 수정)
}); // 저수준 API 사용

export const insertCoBuying = async (cobuying: CoBuyingPost): Promise<CoBuyingSimple> => {
    const timestamp = new Date().toISOString();

    // DynamoDB에 삽입할 데이터 맵핑
    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
        TableName: process.env.CoBuyingTableName || 'CoBuyingTable', // 환경 변수로 테이블 이름 지정
        Item: {
            id: cobuying.id, // 공구글 고유 ID
            productName: cobuying.productName, // 상품 이름
            productLink: cobuying.productLink || null, // 상품 링크 (선택적, null 허용)
            ownerName: cobuying.ownerName, // 공구장 이름
            totalPrice: cobuying.totalPrice, // 공구 상품 총액
            attendeeCount: cobuying.attendeeCount, // 신청자 수 (공구장 포함)
            deadline: cobuying.deadline, // 신청 마감일
            memo: cobuying.memo || null, // 메모 (선택적)
            attendeeList: cobuying.attendeeList || [], // 신청자 리스트 (빈 배열 기본값)
            createdAt: timestamp, // 생성일 (ISO 형식)
            status: cobuying.status, // 공구글 상태 (예: 'PREPARING')
            // 수량나눔에만 해당하는 필드
            totalQuantity: cobuying.type === 'quantity' ? cobuying.totalQuantity : undefined,
            ownerQuantity: cobuying.type === 'quantity' ? cobuying.ownerQuantity : undefined,
            ownerPrice: cobuying.type === 'quantity' ? cobuying.ownerPrice : undefined,
            totalAttendeePrice: cobuying.type === 'quantity' ? cobuying.totalAttendeePrice : undefined,
            totalAttendeeQuantity: cobuying.type === 'quantity' ? cobuying.totalAttendeeQuantity : undefined,
            unitPrice: cobuying.type === 'quantity' ? cobuying.unitPrice : undefined,
            // 인원나눔에만 해당하는 필드
            planAttendeeCount: cobuying.type === 'attendee' ? cobuying.planAttendeeCount : undefined,
            perAttendeePrice: cobuying.type === 'attendee' ? cobuying.perAttendeePrice : undefined,
        },
    };

    // DynamoDB와 연결 상태 확인
    try {
        // DynamoDB 연결 상태 점검
        await dynamoDBLowLevel.describeTable({ TableName: process.env.CoBuyingTableName || 'CoBuyingTable' }).promise();
        console.log('DynamoDB 연결 성공');
    } catch (error) {
        console.error('DynamoDB 연결 실패:', error);
        throw new Error('DynamoDB와의 연결에 실패했습니다. ');
    }

    // DynamoDB에 데이터를 삽입
    try {
        const result = await dynamoDB.put(params).promise();

        console.log('DynamoDB에 공구글 저장 성공:', result);
        return {
            id: cobuying.id,
            productName: cobuying.productName,
            ownerName: cobuying.ownerName,
            totalPrice: cobuying.totalPrice,
            attendeeCount: cobuying.attendeeCount,
            deadline: cobuying.deadline,
            status: cobuying.status,
            createdAt: timestamp,
            memo: cobuying.memo || null,
            attendeeList: cobuying.attendeeList || [],
        } as CoBuyingSimple; // 성공적으로 삽입한 후, CoBuyingSimple 타입으로 반환
    } catch (error) {
        console.error('DynamoDB 삽입 중 오류 발생:', error);
        throw new Error('공구글 저장에 실패했습니다.');
    }
};
