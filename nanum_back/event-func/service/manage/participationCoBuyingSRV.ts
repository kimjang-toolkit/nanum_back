import { Attendee } from '@domain/user';
import { Participation, ParticipationQuery } from '@interface/manage';
import { APIERROR } from 'common/responseType';

export const participationCoBuyingSRV = (participation: Participation) => {
    // 공구글이 존재하는지 확인
    //    없으면 404, 신청할 공구글이 존재하지 않습니다.
    // 공구글에 참여자 추가
    //    실패하면, 500, 공구를 신청하지 못했어요. 다시 시도해주세요.
    const updateCommand = getUpdateCommand(participation);
    //
    //
};

function getUpdateCommand(participation: Participation) {
    let updateExpression = 'Set ';
    let conditionExpression = '';
    updateExpression += 'attendeeCount = attendeeCount + 1';
    updateExpression += ', list_append(attendeeList, :newAttendee)';

    const attendee: Attendee = {
        attendeeName: participation.attendeeName,
        attendeePrice: participation.attendeePrice,
        appliedQuantity: participation.attendeeQuantity,
    };

    const expressionAttributeValues = {
        ':newAttendee': attendee,
    };

    if (participation.type === 'quentity') {
        if (!attendee.appliedQuantity) {
            throw new APIERROR(400, '신청 수량을 꼭 입력해주세요.');
        }

        conditionExpression += 'remainQuantity >= :newAppliedQuantity';

        updateExpression += ', totalAttendeePrice = totalAttendeePrice + :newAttendeePrice';
        updateExpression += ', totalAttendeeQuantity = totalAttendeeQuantity + :newAttendeeQuantity';
        updateExpression += ', remainQuantity = remainQuantity - :newAttendeeQuantity';
    } else if (participation.type === 'attendee') {
        // if (coBuying.recruitmentNumbers < coBuying.attendeeCount) {
        //     throw new APIERROR(400, '신청 가능한 인원을 초과했어요.');
        // }

        conditionExpression += 'recruitmentNumbers >= attendeeCount + 1';
    }

    const param = {
        TableName: process.env.CoBuyingTableName || 'CoBuyingTable', // 환경 변수로 테이블 이름 지정
        Key: {
            ownerName: participation.ownerName,
            id: participation.coBuyingId,
        },
        UpdateExpression: 'Set ',
        ExpressionAttributeValues: {},
    } as ParticipationQuery;
}

// // 공구글에 참여자 추가
// function participateCoBuying(participation : Participation, coBuying: CoBuyingPost) {

//   const attendee : Attendee = {
//   attendeeName : participation.attendeeName,
//     attendeePrice : participation.attendeePrice,
//     appliedQuantity : participation.attendeeQuantity
//   }

//   // 공통
//   coBuying.attendeeCount += 1;
//   coBuying.attendeeList.push(attendee);

//   if(coBuying.type === 'quantity'){

//     // 수량 나눔
//     coBuying.totalAttendeePrice += attendee.attendeePrice;
//     coBuying.totalAttendeeQuantity += attendee.appliedQuantity;
//     coBuying.remainQuantity -= attendee.appliedQuantity;
//   } else if(coBuying.type === 'attendee'){

//   }
// }
