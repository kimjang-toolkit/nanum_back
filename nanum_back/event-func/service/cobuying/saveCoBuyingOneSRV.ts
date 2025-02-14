// import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CoBuyingStatus, QuantityCoBuying, AttendeeCoBuying, CoBuyingPost, DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { getFormattedKoreaTime, getKoreaDay } from 'common/time';
import { insertCoBuying } from '@cobuying/saveCoBuyingOneDAO';
import { CoBuyingCreateReq, CoBuyingSummary } from '@interface/cobuying';
import { hashPassword } from '@auth/authEncrptorSRV';
import { scrapProductInformationSRV } from '@product/scrapProductInformationSRV';
import { saveProductInformationSRV } from '@product/saveProductInformationSRV';
import { ProductInformation } from '@interface/product.js';

/**
 * DB에 공구글 데이터 생성
 * 수량나눔과 인원나눔으로 분기해서 공구글을 생성.
 *
 * @param input 공구글 생성 입력 데이터
 * @returns 공구글 생성 출력 데이터
 */
export const saveCoBuying = async (input: CoBuyingCreateReq<DivideType>): Promise<CoBuyingSummary> => {
    // DB 엔드포임트 확인
    let imageUrl;
    try {
        if (input.productLink) {
            const productInformation : ProductInformation = await scrapProductInformationSRV("https://www.coupang.com/vp/products/7581844823");
            console.log('productInformation : ', productInformation);
            if(productInformation.productId !== undefined){
                imageUrl = await saveProductInformationSRV(productInformation);
                input.imageUrl = imageUrl;
            }
        }
    } catch (error) {
        console.error(error);
    }

    let cobuying: CoBuyingPost;
    input.ownerPassword = await hashPassword(input.ownerPassword);
    console.log('input type : ', input.type);
    console.log('DivideType.quantity : ', DivideType.quantity);
    // 방법 1: 문자열로 비교
    if (input.type === DivideType.quantity) {
        // 수량나눔
        cobuying = getQuantityCoBuying(input as CoBuyingCreateReq<DivideType.quantity>);
    } else {
        // 인원나눔
        cobuying = getAttendeeCoBuying(input as CoBuyingCreateReq<DivideType.attendee>);
    }

    const result: CoBuyingSummary = await insertCoBuying(cobuying);
    return result;
};

function getQuantityCoBuying(input: CoBuyingCreateReq<DivideType.quantity>): QuantityCoBuying {
    const createdAt = getFormattedKoreaTime();
    const createdAtDateOnly = getKoreaDay();
    const id = uuidv4();
    const item = {
        ...input,
        id: id,
        createdAt: createdAtDateOnly,
        coBuyingStatus: CoBuyingStatus.APPLYING,
        createdAtId: createdAt + '#' + id,
        deadlineId: input.deadline + '#' + id,
        ownerNameId: input.ownerName + '#' + id,
        deletedYN: 'N',
    };
    if (item.ownerQuantity === undefined) {
        throw new Error('공구장의 수량을 정해주세요.');
    }

    // 공구장의 수량 결정
    // const ownerPrice: number = calculatOwnerQuantityPrice(item);

    // 공구글 단위 가격 계산
    const unitPrice: number = calculatUnitPrice(item);

    // 공구장의 부담액 계산 = 총 가격 - 상품 개당 가격 * 총 수량 + 공구장 할당량 * 상품 개당 가격
    const ownerPrice: number = item.totalPrice - unitPrice * (item.totalQuantity - item.ownerQuantity);

    const hostAttende: Attendee = {
        attendeeName: item.ownerName,
        appliedQuantity: item.ownerQuantity,
        attendeePrice: ownerPrice,
    };
    // 수량나눔
    const quantityCoBuying: QuantityCoBuying = {
        ...item,
        type: DivideType.quantity,
        unitPrice: unitPrice,
        ownerQuantity: item.ownerQuantity,
        ownerPrice: ownerPrice,
        totalAttendeeQuantity: item.ownerQuantity,
        totalAttendeePrice: ownerPrice, // 아직 공구장 밖에 신청자가 없기 때문에 공구장 부담액이 전체 부담액.
        remainQuantity: item.totalQuantity - item.ownerQuantity,
        attendeeCount: 1,
        attendeeList: [hostAttende],
    };

    return quantityCoBuying;
}

function getAttendeeCoBuying(input: CoBuyingCreateReq<DivideType.attendee>): AttendeeCoBuying {
    const createdAt = getFormattedKoreaTime();
    const createdAtDateOnly = getKoreaDay();
    const id = uuidv4();
    const item = {
        ...input,
        id: id,
        createdAt: createdAtDateOnly,
        coBuyingStatus: CoBuyingStatus.APPLYING,
        createdAtId: createdAt + '#' + id,
        deadlineId: input.deadline + '#' + id,
        ownerNameId: input.ownerName + '#' + id,
        deletedYN: 'N',
    };
    if (item.targetAttendeeCount === undefined) {
        throw new Error('목표 신청자 수를 정해주세요.');
    }

    // 인당 가격 계산
    const perAttendeePrice: number = calculatAttendeePrice(item);

    // 공구장의 부담액 계산
    const ownerPrice: number = item.totalPrice - perAttendeePrice * (item.targetAttendeeCount - 1);

    const hostAttendee: Attendee = {
        attendeeName: item.ownerName,
        appliedQuantity: item.ownerQuantity || 1,
        attendeePrice: ownerPrice, // 일단 단순 계산, 공구가 마감될 때 totalPrice - totalAttendeeCount*perAttendeePrice 로 업데이트
    };

    const attendeeCoBuying: AttendeeCoBuying = {
        ...item,
        type: DivideType.attendee,
        totalAttendeePrice: ownerPrice,
        remainAttendeeCount: item.targetAttendeeCount - 1, // 공구장 신청자 수 1명 빼기
        targetAttendeeCount: item.targetAttendeeCount,
        perAttendeePrice: perAttendeePrice,
        attendeeCount: 1,
        attendeeList: [hostAttendee],
    };

    console.log('attendee item : ', attendeeCoBuying);
    return attendeeCoBuying;
}

/**
 * 조승효B 요구 사항 : 소수점 이하 절삭
 * @param input
 * @returns
 */
function calculatAttendeePrice(input: CoBuyingCreateReq<DivideType.attendee>): number {
    // 소수점 이하 절삭
    const attendeePrice = input.totalPrice / input.targetAttendeeCount;
    return Math.floor(attendeePrice);
}

/**
 * 조승효B 요구 사항 : 소수점 이하의 값을 절삭
 * 상품 개당 가격 계산
 * @param input
 * @returns
 */
function calculatUnitPrice(input: CoBuyingCreateReq<DivideType>): number {
    // 소수점 이하 절삭
    const unitPrice = input.totalPrice / input.totalQuantity;
    return Math.floor(unitPrice);
}

// export const queryCoBuyingPage = async (input: CoBuyingQueryParams): Promise<CoBuyingSimple> => {
//     // 정렬 기준에 따라 다른 쿼리를 이용할 예정

//     return {};
// };
