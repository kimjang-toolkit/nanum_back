import { Attendee } from '@domain/user';

export function mapToAttendeeList(res: any): Attendee[] {
    console.log('res.attendeeList : ', res.attendeeList.L[0]);
    return (
        res.attendeeList?.L?.map(
            (attendee: any) =>
                ({
                    name: attendee.M.name.S,
                    totalQuantity: Number(attendee.M.totalQuantity.N || 0),
                    totalPrice: Number(attendee.M.totalPrice.N || 0),
                    options: attendee.M.options.L.map((option: any) => ({
                        optionId: Number(option.M.optionId.N),
                        name: option.M.name.S,
                        quantity: Number(option.M.quantity.N),
                    })),
                } as Attendee),
        ) || []
    );
}
