import { DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { Participation, ParticipationQuery } from '@interface/manage';
import { participationCoBuyingDAO } from '@manage/participationCoBuyingDAO';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { getAttendeeListDAO } from '@manage/getAttendeeListDAO';
import { APIERROR } from 'common/responseType';

export const participationCoBuyingSRV = async (participation: Participation) => {
    // 공구글에 참석자 이름 리스트 만들기
    //    만약 이미 참석자 이름을 사용 중이면 다른 이름을 사용해야 함

    const attendeeList: Attendee[] = await getAttendeeListDAO(participation.ownerName, participation.coBuyingId);
    console.log('attendeeList', attendeeList);
    if (attendeeList.find((attendee) => attendee.attendeeName === participation.attendeeName)) {
        throw new APIERROR(400, '이미 사용 중인 이름입니다. 다른 이름을 사용해주세요.');
    }

    // 공구글에 참여자 추가
    //    실패하면, 500, 공구를 신청하지 못했어요. 다시 시도해주세요.
    const updateCommand = getUpdateCommand(participation);

    const result = await participationCoBuyingDAO(updateCommand);
};

function getUpdateCommand(participation: Participation): ParticipationQuery {
    let updateExpression = 'SET ';
    let conditionExpression = '';
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    updateExpression += '#attendeeCount = #attendeeCount + :increment'; // 참여자 수 증가
    expressionAttributeNames['#attendeeCount'] = 'attendeeCount';
    expressionAttributeValues[':increment'] = 1;
    // 참여자 정보 추가
    const attendee: Attendee = {
        attendeeName: participation.attendeeName,
        attendeePrice: participation.attendeePrice,
        appliedQuantity: participation.attendeeQuantity,
    };

    // 참여자 정보 추가
    updateExpression += ', #attendeeList = list_append(#attendeeList, :newAttendee)'; // 참여자 리스트 추가
    expressionAttributeNames['#attendeeList'] = 'attendeeList';
    expressionAttributeValues[':newAttendee'] = [attendee];

    // 신청 가능 수량 조건 확인
    conditionExpression += '#remainQuantity >= :newAppliedQuantity';
    expressionAttributeNames['#remainQuantity'] = 'remainQuantity';
    expressionAttributeValues[':newAppliedQuantity'] = participation.attendeeQuantity;

    // 수량 나눔에 대한 update 문 작성
    if (participation.type === DivideType.quantity) {
        updateExpression += ', #totalAttendeePrice = #totalAttendeePrice + :newAttendeePrice';
        updateExpression += ', #totalAttendeeQuantity = #totalAttendeeQuantity + :newAttendeeQuantity'; // 참여자 수량 증가
        expressionAttributeNames['#totalAttendeePrice'] = 'totalAttendeePrice';
        expressionAttributeNames['#totalAttendeeQuantity'] = 'totalAttendeeQuantity';
        expressionAttributeValues[':newAttendeePrice'] = participation.attendeePrice;
    }

    updateExpression += ', #remainQuantity = #remainQuantity - :newAttendeeQuantity'; // 남은 수량 감소
    expressionAttributeNames['#remainQuantity'] = 'remainQuantity';
    expressionAttributeValues[':newAttendeeQuantity'] = participation.attendeeQuantity;

    const param = {
        TableName: process.env.CoBuyingTableName || 'CoBuyingTable', // 환경 변수로 테이블 이름 지정
        Key: {
            ownerName: participation.ownerName,
            id: participation.coBuyingId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: conditionExpression,
        ReturnValues: ReturnValue.ALL_NEW,
    } as ParticipationQuery;
    console.log('query param', param);
    return param;
}
