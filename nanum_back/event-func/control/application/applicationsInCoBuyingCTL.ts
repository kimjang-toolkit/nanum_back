import { ApplicationDTO } from '@interface/application';
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR } from '@common/responseType';
import { ApplicationReq } from '@interface/application';
import { applicationsInCoBuyingSRV } from '@application/applicationsInCoBuyingSRV';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';

/**
 * 공구 신청 정보 검증
 * 신청 수량과 인원 수로 계산되기 때문에 가격 검증 생략
 * 상품 옵션 정보 추가 for 수량 나눔 공구
 * @param event 
 * @returns 
 */
function validateApplication(event: APIGatewayProxyEventV2): ApplicationReq {
    if (!event.body) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }
    const body = JSON.parse(event.body);

    if (
        body.attendeeName === undefined ||
        body.coBuyingId === undefined ||
        body.ownerName === undefined 
        // 수량 나눔 시 신청자가 구매할 세부 옵션 속성 추가로 인해 수량 검증 생략
        // body.attendeeQuantity === undefined ||
        // body.attendeeQuantity <= 0 ||
        // body.attendeeQuantity > Number.MAX_SAFE_INTEGER // 수량이 int 범위를 넘어가면 안됨
    ) {
        throw new APIERROR(400, '정확한 신청 정보를 전달해주세요.');
    }
    return {
        attendeeName: body.attendeeName,
        attendeePrice: 0,
        attendeeQuantity: 0,
        coBuyingId: body.coBuyingId,
        ownerName: body.ownerName,
        itemOptions: body.itemOptions
    } as ApplicationReq;
}


/**
 * 공구 신청 처리 핸들러
 * 
 * 공구 신청 할 때 
 *  공구장의 가정산 부담액과 가정산 부담 수량이 변경됨.
 *  신청자의 가정산 부담액과 부담 수량이 신청 값과 다를 수 있음.
 *  신청자 부담액은 기준 가격에 신청 정보로 계산
 *      수량나눔: 기준가격 * 신청 수량
 *      인원나눔: 기준가격 * 1
 * 
 * @param event 
 * @returns 
 */
export const applicationsInCoBuyingHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
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
