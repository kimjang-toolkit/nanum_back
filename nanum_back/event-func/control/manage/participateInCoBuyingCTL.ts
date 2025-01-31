import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR, BaseHeader } from '@common/responseType';
import { Application } from '@interface/manage';
import { participationCoBuyingSRV } from '@manage/participationCoBuyingSRV';

function validateParticipation(event: APIGatewayProxyEvent): Application {
    if (event.body === null) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }
    const body = JSON.parse(event.body);

    if (
        body.attendeeName === undefined ||
        body.attendeePrice === undefined ||
        body.coBuyingId === undefined ||
        body.ownerName === undefined
    ) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }

    return {
        attendeeName: body.attendeeName,
        attendeePrice: body.attendeePrice,
        attendeeQuantity: body.attendeeQuantity,
        coBuyingId: body.coBuyingId,
        ownerName: body.ownerName,
    } as Application;
}

export const participateInCoBuyingHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let participation: Application;
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
