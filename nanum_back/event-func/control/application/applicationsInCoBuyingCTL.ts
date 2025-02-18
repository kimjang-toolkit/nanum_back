import { ApplicationDTO } from './../../../api-interface/src/interface/application';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR, BaseHeader } from '@common/responseType';
import { ApplicationReq } from '@interface/application';
import { applicationsInCoBuyingSRV } from '@application/applicationsInCoBuyingSRV';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';

function validateApplication(event: APIGatewayProxyEvent): ApplicationReq {
    if (event.body === null) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }
    const body = JSON.parse(event.body);

    if (
        body.attendeeName === undefined ||
        body.attendeePrice === undefined ||
        body.attendeePrice <= 0 ||
        body.attendeeQuantity === undefined ||
        body.attendeeQuantity <= 0 ||
        body.coBuyingId === undefined ||
        body.ownerName === undefined ||
        body.attendeePrice > Number.MAX_SAFE_INTEGER ||
        body.attendeeQuantity > Number.MAX_SAFE_INTEGER
    ) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }

    return {
        attendeeName: body.attendeeName,
        attendeePrice: body.attendeePrice,
        attendeeQuantity: body.attendeeQuantity,
        coBuyingId: body.coBuyingId,
        ownerName: body.ownerName,
    } as ApplicationReq;
}

export const applicationsInCoBuyingHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let application: ApplicationReq;
    try {
        application = validateApplication(event);
    } catch (error) {
        if (error instanceof APIERROR) {
            return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
        }
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }

    console.log('application : ', application);
    try {
        const message: ApplicationDTO = await applicationsInCoBuyingSRV(application);
        return new LambdaReturnDto(200, { message: application.attendeeName + `님! ${message.message} 공구 신청 감사합니다!` }, event).getLambdaReturnDto();
    } catch (error) {
        console.error('error : ', error);
        if (error instanceof APIERROR) {
            return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
        }
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
};
