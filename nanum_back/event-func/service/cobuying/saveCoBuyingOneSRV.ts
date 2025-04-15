// import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CoBuyingStatus, QuantityCoBuying, AttendeeCoBuying, CoBuyingPost, DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { getFormattedKoreaTime } from 'common/time';
import { insertCoBuying } from '@cobuying/saveCoBuyingOneDAO';
import { CoBuyingCreateReq, CoBuyingSummary } from '@interface/cobuying';
import { hashPassword } from '@auth/authEncrptorSRV';
import { retrieveProductInformation } from '@product/retrieveProductInformation';
import { ItemOption, ItemOptionBase } from '@domain/product';
import { createPreviewPageSRV } from '@cobuying/createPreviewPageSRV';

/**
 * DB에 공구글 데이터 생성
 * 수량나눔과 인원나눔으로 분기해서 공구글을 생성.
 * 
 * 조승효B 요구 사항 : 수량, 인원 기준 가격을 계산할 때 소수점 이하의 값을 올림
 *                 가정산 부담액 속성 추가
 * 스크래핑한 상품 정보를 상품원장에 저장
 *
 * @param input 공구글 생성 입력 데이터
 * @returns 공구글 생성 출력 데이터
 */
export const saveCoBuying = async (input: CoBuyingCreateReq<DivideType>): Promise<CoBuyingSummary> => {
    
    // 상품 정보 스크래핑
    const productInformation = await retrieveProductInformation(input);
    if(productInformation.productId){
        // 상품원장에 저장
        // await saveProductLedger(productInformation);
    }
    
    let cobuying: CoBuyingPost;
    input.ownerPassword = await hashPassword(input.ownerPassword);
    console.log('input type : ', input.type);
    console.log('DivideType.quantity : ', DivideType.quantity);
    
    /** 썸네일 이미지가 없을 경우 원본 이미지를 사용 jpeg, jpg, png, webp, heic, heif 타입만 사용 */
    if(!input.imageUrl || input.imageUrl === ''){
        if(input.thumbnailImageUrl && input.thumbnailImageUrl !== ''){
            input.imageUrl = input.thumbnailImageUrl;
        } else {
            input.imageUrl = input.originalImageUrl;
        }
    }

    // 방법 1: 문자열로 비교
    if (input.type === DivideType.quantity) {
        // 수량나눔
        cobuying = getQuantityCoBuying(input as CoBuyingCreateReq<DivideType.quantity>);
    } else {
        // 인원나눔
        cobuying = getAttendeeCoBuying(input as CoBuyingCreateReq<DivideType.attendee>);
    }

    // 미리보기 페이지 링크 생성
    const previewPageUrl = await createPreviewPageSRV(cobuying);
    console.log('previewPageUrl : ', previewPageUrl);
    if(previewPageUrl !== ''){ // 미리보기 페이지 링크가 생성되었을 경우
        cobuying.previewPageUrl = previewPageUrl;
    }

    // 비동기로 상품원장에 저장
    // await saveProductLedger(input);

    // 공구글 생성
    const result: CoBuyingSummary = await insertCoBuying(cobuying);
    return result;
};



function getQuantityCoBuying(input: CoBuyingCreateReq<DivideType.quantity>): QuantityCoBuying {
    const createdAt = getFormattedKoreaTime();
    const id = uuidv4();
    const totalQuantity: number = input.itemOptions.reduce((acc, curr) => acc + curr.quantity, 0);
    const ownerQuantity: number = input.ownerOptions.reduce((acc, curr) => acc + curr.quantity, 0);
    const item = {
        ...input,
        id: id,
        createdAt: createdAt,
        coBuyingStatus: Number(CoBuyingStatus.APPLYING),
        createdAtId: createdAt + '#' + id,
        // deadlineId: input.deadline + '#' + id,
        ownerNameId: input.ownerName + '#' + id,
        deletedYN: 'N',
        totalQuantity: totalQuantity,
        ownerQuantity: totalQuantity,
        sharingDateTime: input.sharingDateTime,
        sharingLocation: input.sharingLocation,
        imageUrl: input.thumbnailImageUrl,
        originalImageUrl: input.originalImageUrl,
    };
   
    // 공구글 단위 가격 계산
    const unitPrice: number = calculatUnitPrice(item);

    // 공구장의 신청 부담액 계산 = 단위 가격 * 신청 수량
    const ownerPrice: number = unitPrice * ownerQuantity;

    // itemOptions 초기화
    const {itemOptions, ownerOptions} = getItemOptionsInitial(input);

    /**
         * 초기에 신청자는 공구장 한명이므로 공구장 부담액이 전체 부담액.
         * 사람들이 신청하면서 공구장의 가정산 부담액과 가정산 부담 수량이 변경됨.
         */
    const hostAttende: Attendee = {
        name: item.ownerName, // 공구장 이름
        totalQuantity: ownerQuantity, // 실제 공구장 구매 수량
        totalPrice: ownerPrice, // 공구장 신청 부담액
        options: ownerOptions, // 공구장 구매 옵션, 수량 기준만 사용하는 속성
        // estimatedSettlePrice: item.totalPrice, // 가정산 부담액
        // estimatedSettleQuantity: item.totalQuantity, // 가정산 부담 수량
    };
    // 수량나눔
    const quantityCoBuying: QuantityCoBuying = {
        ...item,
        type: DivideType.quantity,
        unitPrice: unitPrice,
        ownerQuantity: item.totalQuantity, // 공구장이 구매할 가정산 수량
        ownerPrice: item.totalPrice, // 공구장이 부담할 가정산 금액
        totalAttendeeQuantity: ownerQuantity,
        totalAttendeePrice: ownerPrice, // 아직 공구장 밖에 신청자가 없기 때문에 공구장 부담액이 전체 부담액.
        remainQuantity: item.totalQuantity - ownerQuantity,
        attendeeCount: 1,
        attendeeList: [hostAttende],
        ownerOptions: item.itemOptions, // 공구장이 구매할 가정산 수량, 이름과 수량만 있으면 된다. 남은 수량은 필요 없음.
        itemOptions: itemOptions,
    };

    return quantityCoBuying;
}

function getAttendeeCoBuying(input: CoBuyingCreateReq<DivideType.attendee>): AttendeeCoBuying {
    const createdAt = getFormattedKoreaTime();
    const id = uuidv4();
    const item = {
        ...input,
        id: id,
        createdAt: createdAt,
        coBuyingStatus: Number(CoBuyingStatus.APPLYING),
        createdAtId: createdAt + '#' + id,
        // deadlineId: input.deadline + '#' + id,
        ownerNameId: input.ownerName + '#' + id,
        deletedYN: 'N',
        sharingDateTime: input.sharingDateTime,
        sharingLocation: input.sharingLocation,
    };
    if (item.targetAttendeeCount === undefined) {
        throw new Error('목표 신청자 수를 정해주세요.');
    }

    // 인당 가격 계산
    const perAttendeePrice: number = calculatAttendeePrice(item);
    // 인당 구매 수량 계산
    const perAttendeeQuantity: number = calculatPerAttendeeQuantity(item);
    // 공구장의 부담액 계산
    // const ownerPrice: number = item.totalPrice - perAttendeePrice * (item.targetAttendeeCount - 1);

    /**
     * 초기에 신청자는 공구장 한명이므로 공구장 부담액이 전체 부담액.
     * 사람들이 신청하면서 공구장의 가정산 부담액과 가정산 부담 수량이 변경됨.
     */
    const hostAttendee: Attendee = {
        name: item.ownerName,
        totalQuantity: 1, // 공구장 구매는 1인이기에 1로 하드코딩
        totalPrice: perAttendeePrice, // 일단 단순 계산, 공구가 마감될 때 totalPrice - totalAttendeeCount*perAttendeePrice 로 업데이트
        // estimatedSettlePrice: item.totalPrice, // 가정산 부담액
        // estimatedSettleQuantity: item.totalQuantity, // 가정산 부담 수량
    };

    const attendeeCoBuying: AttendeeCoBuying = {
        ...item,
        type: DivideType.attendee,
        totalAttendeePrice: perAttendeePrice, // 총 신청 금액
        remainAttendeeCount: item.targetAttendeeCount - 1, // 공구장 신청자 수 1명 빼기
        targetAttendeeCount: item.targetAttendeeCount,
        perAttendeePrice: perAttendeePrice,
        ownerQuantity: item.targetAttendeeCount, // 공구장이 구매할 가정산 수량
        ownerPrice: item.totalPrice, // 공구장이 부담할 가정산 금액
        attendeeCount: 1,
        attendeeList: [hostAttendee],
        perAttendeeQuantity: perAttendeeQuantity,
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
    return Math.ceil(attendeePrice);
}

/**
 * 조승효B 요구 사항 : 소수점 이하의 값을 올림
 * 상품 개당 가격 계산
 * @param input
 * @returns
 */
function calculatUnitPrice(input: CoBuyingCreateReq<DivideType>): number {
    // 소수점 이하 올림
    const unitPrice = input.totalPrice / input.totalQuantity;
    return Math.ceil(unitPrice);
}

// export const queryCoBuyingPage = async (input: CoBuyingQueryParams): Promise<CoBuyingSimple> => {
//     // 정렬 기준에 따라 다른 쿼리를 이용할 예정

//     return {};
// };

function getItemOptionsInitial(input: CoBuyingCreateReq<DivideType.quantity>): {itemOptions: ItemOption[], ownerOptions: ItemOptionBase[]} {
    const itemOptions: ItemOption[] = [];
    const ownerOptions: ItemOptionBase[] = [];

    // 옵션별 신청 가능 수량 계산
    for (const option of input.itemOptions) {
        let optionId = option.optionId;
        const name = option.name;
        const quantity = option.quantity;
        let remainQuantity = quantity;


        
        // 옵션별 신청 가능 수량 계산
        for (const ownerOption of input.ownerOptions) {
            let hasOwnerOption = false;
            if (ownerOption.name === name) {
                if(optionId !== undefined && optionId !== -1){
                    if(ownerOption.optionId === optionId){
                        hasOwnerOption = true;
                        remainQuantity -= ownerOption.quantity;
                    }
                }
            }
            if(hasOwnerOption){
                ownerOptions.push({
                    optionId: optionId,
                    name: ownerOption.name,
                    quantity: ownerOption.quantity,
                } as ItemOptionBase);
            }
        }

        const itemOption: ItemOption = {
            optionId: optionId,
            name: name,
            quantity: quantity,
            remainQuantity: remainQuantity,
        };
        itemOptions.push(itemOption);
    }
    // console.log('itemOptions : ', itemOptions);
    return {itemOptions, ownerOptions};
}

// 인당 구매 수량 계산, 소수점 2자리 미만 버림
function calculatPerAttendeeQuantity(input: CoBuyingCreateReq<DivideType.attendee>): number {
    const perAttendeeQuantity = input.totalQuantity / input.targetAttendeeCount;
    return Math.floor(perAttendeeQuantity * 10) / 10;
}