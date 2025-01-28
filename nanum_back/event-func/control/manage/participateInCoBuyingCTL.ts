import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR, BaseHeader } from '@common/responseType';
import { Participation } from '@interface/manage';
import { participationCoBuyingSRV } from '@manage/participationCoBuyingSRV';
import { DivideType } from '@domain/cobuying';
function validateParticipation(event: APIGatewayProxyEvent): Participation {
    if (event.body === null) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }
    const body = JSON.parse(event.body);

    if (
        body.attendeeName === undefined ||
        body.attendeePrice === undefined ||
        body.coBuyingId === undefined ||
        body.ownerName === undefined ||
        body.type === undefined
    ) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }

    // 수량 나눔인 경우,
    if (body.type === DivideType.quantity) {
        if (body.attendeeQuantity === undefined) {
            throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
        }
    }

    // 인원 나눔인 경우,
    if (body.type === DivideType.attendee) {
        body.attendeeQuantity = 1; // 인원 기준 공구는 1개만 신청 가능
    }

    return {
        attendeeName: body.attendeeName,
        attendeePrice: body.attendeePrice,
        attendeeQuantity: body.attendeeQuantity,
        coBuyingId: body.coBuyingId,
        ownerName: body.ownerName,
        type: body.type,
    } as Participation;
}

export const participateInCoBuyingHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let participation: Participation;
    try {
        participation = validateParticipation(event);
    } catch (error) {
        if (error instanceof APIERROR) {
            return {
                statusCode: error.statusCode,
                headers: BaseHeader,
                body: JSON.stringify({ message: error.message }),
            };
        }
        return {
            statusCode: 500,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }

    console.log('participation : ', participation);
    try {
        await participationCoBuyingSRV(participation);
        return {
            statusCode: 200,
            headers: BaseHeader,
            body: JSON.stringify(participation.attendeeName + '님! 공구 신청 감사합니다!'),
        };
    } catch (error) {
        console.error('error : ', error);
        if (error instanceof APIERROR) {
            return {
                statusCode: error.statusCode,
                headers: BaseHeader,
                body: JSON.stringify({ message: error.message }),
            };
        }
        return {
            statusCode: 500,
            headers: BaseHeader,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
};
