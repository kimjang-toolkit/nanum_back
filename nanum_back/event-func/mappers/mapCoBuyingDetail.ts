import { CoBuyingStatus, DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import {
    AttendeeCoBuyingDetail,
    BaseCoBuyingDetailDTO,
    CoBuyingDetail,
    QuantityCoBuyingDetail,
} from '@interface/cobuying';

// export const CoBuyingDetailProjectionExpression = `
//   id, productName, productLink, ownerName, totalPrice, totalQuantity,
//   attendeeCount, deadline, type, memo , createdAt,
//   coBuyingStatus, sharingDateTime, sharingLocation,
//   ownerQuantity, ownerPrice, totalAttendeePrice, totalAttendeeQuantity,
//   remainQuantity, unitPrice, remainAttendeeCount, targetAttendeeCount,
//   perAttendeePrice, attendeeList`;

export function mapToCoBuyingDetail(res: any): CoBuyingDetail {
    // console.log('res.attendeeList : ', res.attendeeList.L[0].M);
    console.log('res.coBuyingStatus : ', res.coBuyingStatus);
    const baseDetail: BaseCoBuyingDetailDTO = {
        id: res.id.S,
        productName: res.productName.S,
        productLink: res.productLink?.S,
        ownerName: res.ownerName.S,
        totalPrice: Number(res.totalPrice.N),
        totalQuantity: Number(res.totalQuantity.N),
        attendeeCount: Number(res.attendeeCount.N),
        deadline: res.deadline.S,
        type: res.type.S as DivideType,
        memo: res.memo?.S,
        attendeeList:
            res.attendeeList?.L?.map(
                (attendee: any) =>
                    ({
                        attendeeName: attendee.M.attendeeName.S,
                        appliedQuantity: Number(attendee.M.appliedQuantity.N || 0),
                        attendeePrice: Number(attendee.M.attendeePrice.N || 0),
                    } as Attendee),
            ) || [],
        createdAt: res.createdAt.S,
        coBuyingStatus: (res.coBuyingStatus.N || Number(res.coBuyingStatus.S)) as CoBuyingStatus,
        imageUrl: res.imageUrl?.S,
        sharingDateTime: res.sharingDateTime?.S,
        sharingLocation: res.sharingLocation?.S,
    };

    if (baseDetail.type === DivideType.quantity) {
        return {
            ...baseDetail,
            type: DivideType.quantity,
            totalQuantity: Number(res.totalQuantity.N),
            ownerQuantity: Number(res.ownerQuantity.N),
            ownerPrice: Number(res.ownerPrice.N),
            totalAttendeePrice: Number(res.totalAttendeePrice.N),
            totalAttendeeQuantity: Number(res.totalAttendeeQuantity.N),
            remainQuantity: Number(res.remainQuantity.N),
            unitPrice: Number(res.unitPrice.N),
        } as QuantityCoBuyingDetail;
    } else if (baseDetail.type === DivideType.attendee) {
        return {
            ...baseDetail,
            type: DivideType.attendee,
            remainAttendeeCount: Number(res.remainAttendeeCount.N),
            totalAttendeePrice: Number(res.totalAttendeePrice.N),
            targetAttendeeCount: Number(res.targetAttendeeCount.N),
            ownerQuantity: Number(res.ownerQuantity.N || 0), // 공구장이 구매할 가정산 수량
            ownerPrice: Number(res.ownerPrice.N || 0), // 공구장이 부담할 가정산 금액
            perAttendeePrice: Number(res.perAttendeePrice.N),
        } as AttendeeCoBuyingDetail;
    } else {
        throw new Error('Invalid type in response');
    }
}
