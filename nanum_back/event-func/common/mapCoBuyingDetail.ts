import { Attendee } from '@domain/user';
import {
    AttendeeCoBuyingDetail,
    BaseCoBuyingDetail,
    CoBuyingDetail,
    QuantityCoBuyingDetail,
} from '@interface/cobuying';

export function mapToCoBuyingDetail(res: any): CoBuyingDetail {
    console.log('res.attendeeList : ', res.attendeeList);
    const baseDetail: BaseCoBuyingDetail = {
        id: res.id.S,
        productName: res.productName.S,
        productLink: res.productLink?.S,
        ownerName: res.ownerName.S,
        totalPrice: Number(res.totalPrice.N),
        attendeeCount: Number(res.attendeeCount.N),
        deadline: res.deadline.S,
        type: res.type.S as 'quantity' | 'attendee',
        memo: res.memo?.S,
        attendeeList:
            res.attendeeList?.L?.map((attendee: Attendee) => ({
                attendeeName: attendee.attendeeName,
                appliedQuantity: Number(attendee.appliedQuantity || 0),
                attendeePrice: Number(attendee.attendeePrice || 0),
            })) || [],
        createdAt: res.createdAt.S,
        createdAtDateOnly: res.createdAtDateOnly.S,
        coBuyingStatus: Number(res.coBuyingStatus.N),
    };

    if (baseDetail.type === 'quantity') {
        return {
            ...baseDetail,
            type: 'quantity',
            totalQuantity: Number(res.totalQuantity.N),
            ownerQuantity: Number(res.ownerQuantity.N),
            ownerPrice: Number(res.ownerPrice.N),
            totalAttendeePrice: Number(res.totalAttendeePrice.N),
            totalAttendeeQuantity: Number(res.totalAttendeeQuantity.N),
            remainQuantity: Number(res.remainQuantity.N),
            unitPrice: Number(res.unitPrice.N),
        } as QuantityCoBuyingDetail;
    } else if (baseDetail.type === 'attendee') {
        return {
            ...baseDetail,
            type: 'attendee',
            recruitmentNumbers: Number(res.recruitmentNumbers.N),
            perAttendeePrice: Number(res.perAttendeePrice.N),
        } as AttendeeCoBuyingDetail;
    } else {
        throw new Error('Invalid type in response');
    }
}
