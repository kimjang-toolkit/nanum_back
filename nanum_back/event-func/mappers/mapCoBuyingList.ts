import { CoBuyingStatus, DivideType } from '@domain/cobuying';
// import { CoBuyingDetail, CoBuyingKey, CoBuyingSimple } from '@interface/cobuying';
import { AttendeeCoBuyingSummary, CoBuyingKey, CoBuyingSummary, QuantityCoBuyingSummary } from '@interface/cobuying';

export function mapToCoBuyingSummary(res: any): CoBuyingSummary[] {
    // console.log('res : ', res[0]);
    // res.Items가 undefined인 경우 빈 배열을 반환하도록 수정
    // return (res || []).map((item: any) => ({
    //     id: item.id.S, // `id` 필드는 `S`로 저장됨
    //     coBuyingStatus: item.coBuyingStatus ? CoBuyingStatus[item.coBuyingStatus.N] : CoBuyingStatus.APPLYING, // 상태는 가정에 맞게 처리
    //     type: item.type.S as DivideType, // 상태는 가정에 맞게 처리
    //     totalPrice: item.totalPrice ? parseFloat(item.totalPrice.N) : 0, // `totalPrice` 필드가 숫자일 경우
    //     attendeeCount: item.attendeeCount ? parseInt(item.attendeeCount.N, 10) : 0, // `attendeeCount`가 숫자로 저장됨
    //     productName: item.productName ? item.productName.S : '', // `productName` 문자열 필드
    //     ownerName: item.ownerName ? item.ownerName.S : '', // `ownerName` 필드
    //     deadline: item.deadline ? item.deadline.S : '', // `deadline` 필드가 문자열로 저장됨
    //     createdAt: item.createdAt.S, // `createdAt`
    // }));

    return res.map((item: any) => {
        if (item.type.S === DivideType.attendee) {
            return {
                // 참여자 기준
                id: item.id.S,
                coBuyingStatus: item.coBuyingStatus ? CoBuyingStatus[item.coBuyingStatus.N] : CoBuyingStatus.APPLYING,
                type: DivideType.attendee,
                totalQuantity: item.totalQuantity ? parseInt(item.totalQuantity.N, 10) : 0,
                totalPrice: item.totalPrice ? parseFloat(item.totalPrice.N) : 0,
                attendeeCount: item.attendeeCount ? parseInt(item.attendeeCount.N, 10) : 0,
                productName: item.productName ? item.productName.S : '',
                ownerName: item.ownerName ? item.ownerName.S : '',
                deadline: item.deadline ? item.deadline.S : '',
                createdAt: item.createdAt.S,
                targetAttendeeCount: item.targetAttendeeCount ? parseInt(item.targetAttendeeCount.N, 10) : 0,
                remainAttendeeCount: item.remainAttendeeCount ? parseInt(item.remainAttendeeCount.N, 10) : 0,
                perAttendeePrice: item.perAttendeePrice ? parseFloat(item.perAttendeePrice.N) : 0,
            } as AttendeeCoBuyingSummary;
        } else {
            // 수량 기준
            return {
                id: item.id.S,
                coBuyingStatus: item.coBuyingStatus ? CoBuyingStatus[item.coBuyingStatus.N] : CoBuyingStatus.APPLYING,
                type: DivideType.quantity,
                totalQuantity: item.totalQuantity ? parseInt(item.totalQuantity.N, 10) : 0,
                totalPrice: item.totalPrice ? parseInt(item.totalPrice.N) : 0,
                attendeeCount: item.attendeeCount ? parseInt(item.attendeeCount.N, 10) : 0,
                productName: item.productName ? item.productName.S : '',
                ownerName: item.ownerName ? item.ownerName.S : '',
                deadline: item.deadline ? item.deadline.S : '',
                createdAt: item.createdAt.S,
                totalAttendeeQuantity: item.totalAttendeeQuantity ? parseInt(item.totalAttendeeQuantity.N, 10) : 0,
                remainQuantity: item.remainQuantity ? parseInt(item.remainQuantity.N, 10) : 0,
                unitPrice: item.unitPrice ? parseInt(item.unitPrice.N, 10) : 0,
            } as QuantityCoBuyingSummary;
        }
    });
}

export function mapToCoBuyingEvaluatedKey(req: any): CoBuyingKey {
    console.log('req : ', req);
    return {
        id: req.id.S,
        deletedYN: req.deletedYN.S,
        createdAtId: req.createdAtId.S,
        ownerName: req.ownerName.S,
    } as CoBuyingKey;
    // else if (req.deadline) {
    //     // createdAt이 없고 deadline이 존재하면 DeadlineKey로 매핑
    //     return {
    //         id: req.id.S,
    //         key: 'deadline',
    //         deadline: req.deadline.S,
    //         ownerName: req.ownerName.S,
    //     };
    // }
}
