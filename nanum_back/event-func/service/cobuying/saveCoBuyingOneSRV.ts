// import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CoBuyingStatus, QuantityCoBuying, AttendeeCoBuying, CoBuyingPost } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { getKoreaDay, getKoreaTime } from 'common/time';
import { insertCoBuying } from '@cobuying/saveCoBuyingOneDAO';
import { CoBuyingCreateReq, CoBuyingSimple } from '@interface/cobuying';

/**
 * DB에 공구글 데이터 생성
 * 수량나눔과 인원나눔으로 분기해서 공구글을 생성.
 *
 * @param input 공구글 생성 입력 데이터
 * @returns 공구글 생성 출력 데이터
 */
export const saveCoBuying = async (input: CoBuyingCreateReq): Promise<CoBuyingSimple> => {
    // DB 엔드포임트 확인

    let cobuying: CoBuyingPost;
    if (input.type === 'quantity') {
        // 수량나눔
        cobuying = getQuantityCoBuying(input);
    } else {
        // 인원나눔
        cobuying = getAttendeeCoBuying(input);
    }

    const result: Promise<CoBuyingSimple> = insertCoBuying(cobuying);
    return result;
};

function getQuantityCoBuying(input: CoBuyingCreateReq): QuantityCoBuying {
    const timestamp = getKoreaTime();
    const createdAtDateOnly = getKoreaDay();
    const id = uuidv4();

    const item = {
        id: id,
        createdAt: createdAtDateOnly,
        createdAtDateOnly: createdAtDateOnly,
        coBuyingStatus: CoBuyingStatus.PREPARING,
        createdAtId: timestamp + '#' + id,
        deadlineId: input.deadline + '#' + id,
        ownerNameId: input.ownerName + '#' + id,
        ...input,
    };
    if (item.ownerQuantity === undefined) {
        throw new Error('공구장의 수량을 정해주세요.');
    }

    // 공구장의 수량 결정
    const ownerPrice: number = calculatOwnerQuantityPrice(item);

    // 공구글 단위 가격 계산
    const unitPrice: number = calculatUnitPrice(item);

    const hostAttende: Attendee = {
        attendeeName: item.ownerName,
        appliedQuantity: item.ownerQuantity || undefined,
        attendeePrice: ownerPrice,
    };
    // 수량나눔
    const quantityCoBuying: QuantityCoBuying = {
        ...item,
        type: 'quantity',
        unitPrice: unitPrice,
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
    const id = uuidv4();
    const item = {
        id: id,
        createdAt: createdAtDateOnly,
        createdAtDateOnly: createdAtDateOnly,
        coBuyingStatus: CoBuyingStatus.PREPARING,
        createdAtId: timestamp + '#' + id,
        deadlineId: input.deadline + '#' + id,
        ownerNameId: input.ownerName + '#' + id,
        ...input,
    };
    if (item.recruitmentNumbers === undefined) {
        throw new Error('목표 신청자 수를 정해주세요.');
    }
    if (item.recruitmentNumbers === undefined) {
        throw new Error('신청자 1인당 부담 금액을 정해주세요.');
    }

    // 인당 가격 계산
    const perAttendeePrice: number = calculatAttendeePrice(item);

    const hostAttendee: Attendee = {
        attendeeName: item.ownerName,
        appliedQuantity: item.ownerQuantity || 1,
        attendeePrice: perAttendeePrice, // 일단 단순 계산, 공구가 마감될 때 totalPrice - totalAttendeeCount*perAttendeePrice 로 업데이트
    };

    const attendeeCoBuying: AttendeeCoBuying = {
        ...item,
        type: 'attendee',
        recruitmentNumbers: item.recruitmentNumbers, // item으로 바로 사용
        perAttendeePrice: perAttendeePrice,
        attendeeCount: 1,
        attendeeList: [hostAttendee],
    };

    console.log('attendee item : ', attendeeCoBuying);
    return attendeeCoBuying;
}

function calculatOwnerQuantityPrice(input: CoBuyingCreateReq): number {
    return ((input.ownerQuantity || 0) * input.totalPrice) / input.totalQuantity;
}

function calculatAttendeePrice(input: CoBuyingCreateReq): number {
    return input.totalPrice / (input.recruitmentNumbers || 1);
}

function calculatUnitPrice(input: CoBuyingCreateReq): number {
    return input.totalPrice / (input.totalQuantity || 1);
}

// export const queryCoBuyingPage = async (input: CoBuyingQueryParams): Promise<CoBuyingSimple> => {
//     // 정렬 기준에 따라 다른 쿼리를 이용할 예정

//     return {};
// };
