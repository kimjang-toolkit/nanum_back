// import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import {
    CoBuyingStatus,
    CoBuyingCreateReq,
    CoBuyingSimple,
    QuantityCoBuying,
    AttendeeCoBuying,
    CoBuyingPost,
} from '@api-interface/cobuying';
import { Attendee } from '@api-interface/user';
import { insertCoBuying } from './query';
import { getKoreaDay, getKoreaTime } from 'common/time';

/**
 * DB에 공구글 데이터 생성
 * 수량나눔과 인원나눔으로 분기해서 공구글을 생성.
 *
 * @param input 공구글 생성 입력 데이터
 * @returns 공구글 생성 출력 데이터
 */
export const saveCoBuying = async (input: CoBuyingCreateReq): Promise<CoBuyingSimple> => {
    // DB 엔드포임트 확인
    console.log(process.env.DYNAMO_DB_URL);
    console.log(process.env.REGION);

    let cobuying: CoBuyingPost;
    if (input.type === 'quantity') {
        // 수량나눔
        cobuying = getQuantityCoBuying(input);
    } else {
        // 인원나눔
        cobuying = getAttendeeCoBuying(input);
    }

    // const params: DynamoDB.DocumentClient.PutItemInput = {
    //     TableName: 'CoBuyingTable', // DynamoDB 테이블 이름
    //     Item: {
    //         id: item.id,
    //         productName: item.productName, // 정렬 키로 사용할 productName
    //         productLink: item.productLink || null, // 상품 링크
    //         ownerName: item.ownerName,
    //         totalPrice: item.totalPrice,
    //         attendeeCount: 1, // 공구장 본인
    //         deadline: item.deadline,
    //         memo: item.memo || null, // 선택적 필드는 null 처리
    //         attendeeList: [], // 공구장만 포함된 상태.
    //     },
    // };

    // await dynamodb
    //     .put({
    //         TableName: 'cobuying',
    //         Item: item,
    //     })
    //     .promise();

    const result: Promise<CoBuyingSimple> = insertCoBuying(cobuying);
    return result;
};

function getQuantityCoBuying(input: CoBuyingCreateReq): QuantityCoBuying {
    const timestamp = getKoreaTime();
    const createdAtDateOnly = getKoreaDay();
    const item = {
        id: uuidv4(),
        createdAt: timestamp,
        createdAtDateOnly: createdAtDateOnly,
        status: CoBuyingStatus.PREPARING,
        ...input,
    };
    if (item.ownerQuantity === undefined) {
        throw new Error('공구장의 수량을 정해주세요.');
    }
    if (item.unitPrice === undefined) {
        throw new Error('단위 금액을 입력해주세요.');
    }

    // 공구장의 수량 결정
    const ownerPrice: number = calculatOwnerQuantityPrice(item);
    const hostAttende: Attendee = {
        attendeeName: item.ownerName,
        appliedQuantity: item.ownerQuantity || undefined,
        attendeePrice: ownerPrice,
    };
    // 수량나눔
    const quantityCoBuying: QuantityCoBuying = {
        ...item,
        type: 'quantity',
        unitPrice: item.unitPrice,
        ownerQuantity: item.ownerQuantity,
        ownerPrice: ownerPrice,
        totalAttendeeQuantity: item.ownerQuantity,
        totalAttendeePrice: ownerPrice, // 아직 공구장 밖에 신청자가 없기 때문에 공구장 부담액이 전체 부담액.
        attendeeCount: 1,
        attendeeList: [hostAttende],
    };

    return quantityCoBuying;
}

function getAttendeeCoBuying(input: CoBuyingCreateReq): AttendeeCoBuying {
    const timestamp = new Date().toISOString();
    const createdAtDateOnly = getKoreaDay();
    const item = {
        id: uuidv4(),
        createdAt: timestamp,
        createdAtDateOnly: createdAtDateOnly,
        status: CoBuyingStatus.PREPARING,
        ...input,
    };
    if (item.planAttendeeCount === undefined) {
        throw new Error('목표 신청자 수를 정해주세요.');
    }
    if (item.perAttendeePrice === undefined) {
        throw new Error('신청자 1인당 부담 금액을 정해주세요.');
    }
    // 인원 나눔에서 공구장 부담액 계산
    const ownerPrice: number = calculatOwnerAttendeePrice(item);
    const hostAttende: Attendee = {
        attendeeName: item.ownerName,
        appliedQuantity: item.ownerQuantity || undefined,
        attendeePrice: ownerPrice,
    };
    const attendeeCoBuying: AttendeeCoBuying = {
        ...item,
        type: 'attendee',
        planAttendeeCount: item.planAttendeeCount, // item으로 바로 사용
        perAttendeePrice: item.perAttendeePrice, // item으로 바로 사용
        attendeeCount: 1,
        attendeeList: [hostAttende],
    };
    return attendeeCoBuying;
}

function calculatOwnerQuantityPrice(input: CoBuyingCreateReq): number {
    return ((input.ownerQuantity || 0) * input.totalPrice) / input.totalQuantity;
}

function calculatOwnerAttendeePrice(input: CoBuyingCreateReq): number {
    return input.totalPrice / (input.planAttendeeCount || 1);
}
