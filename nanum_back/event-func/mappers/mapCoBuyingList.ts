import { CoBuyingStatus, DivideType } from '@domain/cobuying';
// import { CoBuyingDetail, CoBuyingKey, CoBuyingSimple } from '@interface/cobuying';
import { AttendeeCoBuyingSummary, CoBuyingKey, CoBuyingSummary, QuantityCoBuyingSummary } from '@interface/cobuying';

// export const CoBuyingSummaryProjectionExpression = 'id, coBuyingStatus, totalQuantity, '
//                         +'totalPrice, attendeeCount, productName, ownerName, deadline, createdAt, targetAttendeeCount, '
//                         +'remainAttendeeCount, perAttendeePrice, sharingDateTime, sharingLocation, totalAttendeeQuantity, '
//                         +'remainQuantity, unitPrice';

export function mapToCoBuyingSummary(res: any): CoBuyingSummary[] {


    return res.map((item: any) => {
        if (item.type.S === DivideType.attendee) {
            return {
                // 참여자 기준
                id: item.id.S,
                coBuyingStatus: (item.coBuyingStatus ? (item.coBuyingStatus.N || Number(item.coBuyingStatus.S)) : Number(CoBuyingStatus.APPLYING)) as CoBuyingStatus,
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
                sharingDateTime: item.sharingDateTime?.S,
                sharingLocation: item.sharingLocation?.S,
            } as AttendeeCoBuyingSummary;
        } else {
            // 수량 기준
            return {
                id: item.id.S,
                coBuyingStatus: (item.coBuyingStatus ? (item.coBuyingStatus.N || Number(item.coBuyingStatus.S)) : Number(CoBuyingStatus.APPLYING)) as CoBuyingStatus,
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
                sharingDateTime: item.sharingDateTime?.S,
                sharingLocation: item.sharingLocation?.S,
            } as QuantityCoBuyingSummary;
        }
    });
}

export function mapToCoBuyingEvaluatedKey(req: any): CoBuyingKey {
    // console.log('req : ', req);
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
