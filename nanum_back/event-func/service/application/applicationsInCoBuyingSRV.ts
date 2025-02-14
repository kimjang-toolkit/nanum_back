import { DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { ApplicationDTO, ApplicationReq, CoBuyingApplication } from '@interface/application';
import { ApplicationQuery } from '@query-interface/application';
import { applicationCoBuyingDAO } from '@application/applicationCoBuyingDAO';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { getAttendeeListDAO } from '@application/getAttendeeListDAO';
import { APIERROR } from 'common/responseType';
import { AttendeeCoBuyingDetail, CoBuyingDetail, QuantityCoBuyingDetail } from '@interface/cobuying';

export const applicationsInCoBuyingSRV = async (application: ApplicationReq) => {
    // 공구글에 참석자 이름 리스트 만들기
    //    만약 이미 참석자 이름을 사용 중이면 다른 이름을 사용해야 함
    try {
        const coBuyingDetail: CoBuyingDetail = await getAttendeeListDAO(
            application.ownerName,
            application.coBuyingId,
        );

        const attendeeList: Attendee[] = coBuyingDetail.attendeeList || [];
        const coBuyingType: DivideType = coBuyingDetail.type;
        // console.log('attendeeList', attendeeList);
        if (
            attendeeList.find(
                (attendee: Attendee) => attendee.attendeeName === application.attendeeName,
            )
        ) {
            throw new APIERROR(400, '이미 사용 중인 이름입니다. 다른 이름을 사용해주세요.');
        }

        let updateCommand: ApplicationQuery;
        updateCommand = getUpdateCommand(application, coBuyingDetail);

        // 공구글에 참여자 추가
        //    실패하면, 500, 공구를 신청하지 못했어요. 다시 시도해주세요.
        // const updateCommand = getUpdateCommand(application, coBuyingType);

        const message: ApplicationDTO = await applicationCoBuyingDAO(updateCommand);
        return message;
    } catch (error) {
        if (error instanceof APIERROR) {
            console.error(error);
            throw new APIERROR(error.statusCode, error.message);
        }
        throw new Error('DB 조회 중 문제가 발생했습니다. ');
    }
};

function getUpdateCommand(app: ApplicationReq, coBuyingDetail: CoBuyingDetail): ApplicationQuery {
    // 공구글 타입에 따라 유효성 검사
    validateApp(coBuyingDetail, app);

    const attendee: Attendee = {
        attendeeName: app.attendeeName,
        attendeePrice: app.attendeePrice,
        appliedQuantity: app.attendeeQuantity,
    };

    let updateExpression = 'SET ';
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    // 참여자 수 증가
    updateExpression += '#attendeeCount = #attendeeCount + :increment';
    expressionAttributeNames['#attendeeCount'] = 'attendeeCount';
    expressionAttributeValues[':increment'] = 1;

    // 참여자 리스트 추가
    updateExpression += ', #attendeeList = list_append(#attendeeList, :newAttendee)';
    expressionAttributeNames['#attendeeList'] = 'attendeeList';
    expressionAttributeValues[':newAttendee'] = [attendee];

    // 참여자 총 금액 증가
    updateExpression += ', #totalAttendeePrice = #totalAttendeePrice + :newAttendeePrice';
    expressionAttributeNames['#totalAttendeePrice'] = 'totalAttendeePrice';
    expressionAttributeValues[':newAttendeePrice'] = app.attendeePrice;

    // 수량 나눔 공구글에 대한 추가 업데이트
    if (coBuyingDetail.type === DivideType.quantity) {
        updateExpression += ', #totalAttendeeQuantity = #totalAttendeeQuantity + :newAttendeeQuantity';
        expressionAttributeNames['#totalAttendeeQuantity'] = 'totalAttendeeQuantity';
        expressionAttributeValues[':newAttendeeQuantity'] = app.attendeeQuantity;

        updateExpression += ', #remainQuantity = #remainQuantity - :newAttendeeQuantity';
        expressionAttributeNames['#remainQuantity'] = 'remainQuantity';
        expressionAttributeValues[':newAttendeeQuantity'] = app.attendeeQuantity;
    } else {
        // 인원 나눔 공구글에 대한 추가 업데이트
        // 인원 나눔은 신청자 수 기준이기 때문에 수량은 따로 증가시키지 않음
        updateExpression += ', #remainAttendeeCount = #remainAttendeeCount - :newAttendeeCount';
        expressionAttributeNames['#remainAttendeeCount'] = 'remainAttendeeCount';
        expressionAttributeValues[':newAttendeeCount'] = 1;
    }

    const param = {
        TableName: process.env.CoBuyingTableName || 'CoBuyingTable',
        Key: {
            ownerName: coBuyingDetail.ownerName,
            id: coBuyingDetail.id,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: ReturnValue.ALL_NEW,
    } as ApplicationQuery;
    // console.log('query param', param);
    return param;
}
function validateApp(coBuyingDetail: CoBuyingDetail, app: ApplicationReq) {
    if (coBuyingDetail.type === DivideType.quantity) {
        if (!app.attendeeQuantity) {
            throw new APIERROR(400, '수량을 입력해주세요.');
        }
        if (Math.round(app.attendeePrice) !== Math.round((coBuyingDetail as QuantityCoBuyingDetail).unitPrice * app.attendeeQuantity)) {
            throw new APIERROR(400, '신청 금액이 정확하지 않습니다. 단가와 수량을 확인해주세요.');
        }
        if (app.attendeeQuantity > (coBuyingDetail as QuantityCoBuyingDetail).remainQuantity) {
            throw new APIERROR(400, '남은 수량보다 많은 수량을 신청할 수 없습니다.');
        }
    } else {
        if (app.attendeeQuantity !== 1) {
            throw new APIERROR(400, '인원 나눔은 1인당 1개만 신청 가능합니다.');
        }
        if (Math.round(app.attendeePrice) !== Math.round((coBuyingDetail as AttendeeCoBuyingDetail).perAttendeePrice)) {
            throw new APIERROR(400, '신청 금액이 1인당 금액과 일치하지 않습니다.');
        }
        if (app.attendeeQuantity > (coBuyingDetail as AttendeeCoBuyingDetail).remainAttendeeCount) {
            throw new APIERROR(400, '더 이상 신청할 수 없습니다. 남은 인원이 없습니다.');
        }
    }
}

