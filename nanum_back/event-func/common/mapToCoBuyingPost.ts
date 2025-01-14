import {
    AttendeeCoBuying,
    BaseCoBuying,
    CoBuyingPost,
    CoBuyingStatus,
    QuantityCoBuying,
} from '@api-interface/cobuying';
import { Attendee } from '@api-interface/user';

// 공구글에 맞는 타입으로 매핑하기
export const mapToCoBuyingPost = (item: Record<string, Record<string, any>>): CoBuyingPost => {
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
            recruitmentNumbers: Number(item.planAttendeeCount.N), // 예시로 총 참석자 수를 사용
            perAttendeePrice: Number(item.perAttendeePrice.N), // 예시로 단가를 사용
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
