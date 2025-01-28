import { Attendee } from '@domain/user';

export function mapToAttendeeList(res: any): Attendee[] {
    console.log('res.attendeeList : ', res.attendeeList.L[0]);
    return (
        res.attendeeList?.L?.map(
            (attendee: any) =>
                ({
                    attendeeName: attendee.M.attendeeName.S,
                    appliedQuantity: Number(attendee.M.appliedQuantity.N || 0),
                    attendeePrice: Number(attendee.M.attendeePrice.N || 0),
                } as Attendee),
        ) || []
    );
}
