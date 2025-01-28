import { DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import {
    AttendeeCoBuyingDetail,
    BaseCoBuyingDetailDTO,
    CoBuyingDetail,
    QuantityCoBuyingDetail,
} from '@interface/cobuying';

export function mapToCoBuyingDetail(res: any): CoBuyingDetail {
    console.log('res.attendeeList : ', res.attendeeList.L[0].M);
    const baseDetail: BaseCoBuyingDetailDTO = {
        id: res.id.S,
        productName: res.productName.S,
        productLink: res.productLink?.S,
        ownerName: res.ownerName.S,
        totalPrice: Number(res.totalPrice.N),
        totalQuantity: Number(res.totalQuantity.N),
        attendeeCount: Number(res.attendeeCount.N),
        deadline: res.deadline.S,
        type: Number(res.type.N),
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
        coBuyingStatus: Number(res.coBuyingStatus.N),
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
            targetAttendeeCount: Number(res.targetAttendeeCount.N),
            recruitmentNumbers: Number(res.recruitmentNumbers.N),
            perAttendeePrice: Number(res.perAttendeePrice.N),
        } as AttendeeCoBuyingDetail;
    } else {
        throw new Error('Invalid type in response');
    }
}
