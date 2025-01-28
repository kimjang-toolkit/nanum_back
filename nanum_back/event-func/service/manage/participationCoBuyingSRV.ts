import { DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { Participation, ParticipationQuery } from '@interface/manage';
import { APIERROR } from 'common/responseType';
import { participationCoBuyingDAO } from '@manage/participationCoBuyingDAO';

export const participationCoBuyingSRV = async (participation: Participation) => {
    // 공구글이 존재하는지 확인
    //    없으면 404, 신청할 공구글이 존재하지 않습니다.
    // 공구글에 참여자 추가
    //    실패하면, 500, 공구를 신청하지 못했어요. 다시 시도해주세요.
    const updateCommand = getUpdateCommand(participation);

    const result = await participationCoBuyingDAO(updateCommand);
};

function getUpdateCommand(participation: Participation): ParticipationQuery {
    let updateExpression = 'Set ';
    let conditionExpression = '';
    const expressionAttributeValues: Record<string, any> = {};
    updateExpression += 'attendeeCount = attendeeCount + 1'; // 참여자 수 증가
    updateExpression += ', list_append(attendeeList, :newAttendee)'; // 참여자 리스트 추가

    const attendee: Attendee = {
        attendeeName: participation.attendeeName,
        attendeePrice: participation.attendeePrice,
        appliedQuantity: participation.attendeeQuantity,
    };

    // 참여자 정보 추가
    expressionAttributeValues[':newAttendee'] = attendee;

    // 수량 나눔 공구인 경우
    if (participation.type === DivideType.quantity) {
        // 수량 나눔 신청 조건 확인
        conditionExpression += 'remainQuantity >= :newAppliedQuantity';
        expressionAttributeValues['newAppliedQuantity'] = participation.attendeeQuantity;

        updateExpression += ', totalAttendeePrice = totalAttendeePrice + :newAttendeePrice';
        updateExpression += ', totalAttendeeQuantity = totalAttendeeQuantity + :newAttendeeQuantity';
        updateExpression += ', remainQuantity = remainQuantity - :newAttendeeQuantity';

        // 참여자 정보 추가
        expressionAttributeValues[':newAttendeePrice'] = participation.attendeePrice;
        expressionAttributeValues[':newAttendeeQuantity'] = participation.attendeeQuantity;
    } else if (participation.type === DivideType.attendee) {
        // 인원 나눔 신청 조건 확인
        conditionExpression += 'recruitmentNumbers >= attendeeCount + 1';
    }

    const param = {
        TableName: process.env.CoBuyingTableName || 'CoBuyingTable', // 환경 변수로 테이블 이름 지정
        Key: {
            ownerName: participation.ownerName,
            id: participation.coBuyingId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: conditionExpression,
    } as ParticipationQuery;
    console.log('query param', param);
    return param;
}
