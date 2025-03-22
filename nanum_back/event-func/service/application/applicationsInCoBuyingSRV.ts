import { DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { ApplicationDTO, ApplicationReq, CoBuyingApplication } from '@interface/application';
import { UpdateDynamoQuery } from '@query-interface/application';
import { applicationCoBuyingDAO } from '@application/applicationCoBuyingDAO';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { queryCoBuyingDetail } from '@cobuying/queryCoBuyingDetailDAO';
import { APIERROR } from 'common/responseType';
import { AttendeeCoBuyingDetail, CoBuyingDetail, QuantityCoBuyingDetail } from '@interface/cobuying';
import { ItemOptionBase } from '@domain/product';

/**
 * 
 * @param application 
 * @returns 
 * 
 * 인원 나눔 신청 시 신청 수량 계산
 *  => 인원 나눔 시 신청 수량 이용해서 부담액 계산 X
 */
export const applicationsInCoBuyingSRV = async (application: ApplicationReq) => {
    // 공구글에 참석자 이름 리스트 만들기
    //    만약 이미 참석자 이름을 사용 중이면 다른 이름을 사용해야 함
    try {
        const coBuyingDetail: CoBuyingDetail = await queryCoBuyingDetail(
            application.ownerName,
            application.coBuyingId,
        );

        let attendeeQuantity = 0;

        // 공구글 타입에 따라 신청자가 부담하는 금액 계산
        if(coBuyingDetail.type === DivideType.quantity) {
            attendeeQuantity = application.itemOptions?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
            application.attendeeQuantity = attendeeQuantity;
            application.attendeePrice = (coBuyingDetail as QuantityCoBuyingDetail).unitPrice * attendeeQuantity;
        } else {
            // attendeeQuantity = 1;
            if( !coBuyingDetail.perAttendeeQuantity || coBuyingDetail.perAttendeeQuantity === 0) {
                application.attendeeQuantity = getPerAttendeeQuantity(coBuyingDetail as AttendeeCoBuyingDetail);
            } else {
                application.attendeeQuantity = coBuyingDetail.perAttendeeQuantity;
            }
            application.attendeePrice = (coBuyingDetail as AttendeeCoBuyingDetail).perAttendeePrice;
        }

        const attendeeList: Attendee[] = coBuyingDetail.attendeeList || [];
        // console.log('attendeeList', attendeeList);
        if (
            attendeeList.find(
                (attendee: Attendee) => attendee.attendeeName === application.attendeeName,
            )
        ) {
            throw new APIERROR(400, '이미 사용 중인 이름입니다. 다른 이름을 사용해주세요.');
        }

        let updateCommand: UpdateDynamoQuery;

        // 공구글 타입에 따라 유효성 검사
        validateApp(coBuyingDetail, application);
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

/**
 * 공구 상태 업데이트 쿼리 생성
 * @param app 
 * @param coBuyingDetail 
 * @returns 
 * 
 * 2025-03-22: 수량 나눔 공구글에 대한 추가 업데이트 추가
 *              수량 나눔 시 상품 옵션의 신청 가능 수량 검증 로직 추가
 */
function getUpdateCommand(app: ApplicationReq, coBuyingDetail: CoBuyingDetail): UpdateDynamoQuery {

    /** 신청자의 상세 옵션 정보 추가 */
    const attendee: Attendee = {
        attendeeName: app.attendeeName,
        attendeePrice: app.attendeePrice || 0,
        attendeeQuantity: app.attendeeQuantity,
    };

    // 신청자의 상세 옵션 정보 추가
    if(app.itemOptions && app.itemOptions.length > 0) {
        attendee.attendeeOptions = app.itemOptions;
    }

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

    // 공구장 가정산 금액 업데이트
    // 신청자가 부담하는 만큼 공구장 부담액이 감소함
    updateExpression += ', #ownerPrice = #ownerPrice - :newAttendeePrice';
    expressionAttributeNames['#ownerPrice'] = 'ownerPrice';
    expressionAttributeValues[':newAttendeePrice'] = app.attendeePrice;

    // 수량 나눔 공구글에 대한 추가 업데이트
    if (coBuyingDetail.type === DivideType.quantity) {
        updateExpression += ', #totalAttendeeQuantity = #totalAttendeeQuantity + :newAttendeeQuantity';
        expressionAttributeNames['#totalAttendeeQuantity'] = 'totalAttendeeQuantity';
        expressionAttributeValues[':newAttendeeQuantity'] = app.attendeeQuantity;

        updateExpression += ', #remainQuantity = #remainQuantity - :newAttendeeQuantity';
        expressionAttributeNames['#remainQuantity'] = 'remainQuantity';
        expressionAttributeValues[':newAttendeeQuantity'] = app.attendeeQuantity;

        // 공구장 가정산 수량 업데이트
        // 신청자가 구매하는 만큼 공구장 가정산 수량이 감소함
        updateExpression += ', #ownerQuantity = #ownerQuantity - :newAttendeeQuantity';
        expressionAttributeNames['#ownerQuantity'] = 'ownerQuantity';
        expressionAttributeValues[':newAttendeeQuantity'] = app.attendeeQuantity;

        // 신청자가 구매할 세부 옵션 신청 가능 수량 업데이트
        const indexes = app.itemOptions?.map((itemOption: ItemOptionBase) => {
                const index = coBuyingDetail.itemOptions.findIndex((itemOption) => itemOption.name === itemOption.name);
                return {
                    // item Option 인덱스
                    index: index,
                    optionName: itemOption.name,
                    optionQuantity: itemOption.quantity,
                }
            });

        indexes?.forEach((option) => {
            if (option.index !== -1) {
                const optionKey = `#itemOptions[${option.index}].remainQuantity`;
                const valueKey = `:decrementRemainQty_${option.index}`;
        
                updateExpression += `, ${optionKey} = ${optionKey} - ${valueKey}`;
                expressionAttributeNames['#itemOptions'] = 'itemOptions';
                expressionAttributeValues[valueKey] = coBuyingDetail.itemOptions[option.index].remainQuantity - option.optionQuantity;
            }
        });

        // 정산용으로 옵션 정보 추가
        const indexesForOwner = app.itemOptions?.map((itemOption: ItemOptionBase) => {
            const index = coBuyingDetail.ownerOptions?.findIndex((itemOption) => itemOption.name === itemOption.name);
            return {
                // item Option 인덱스
                index: index,
                optionName: itemOption.name,
                optionQuantity: itemOption.quantity,
            }
        });

        // 공구장이 구매할 세부 옵션 가정산 수량 업데이트
        indexesForOwner?.forEach((option) => {
            if(option.index !== -1) {
                const optionKey = `#ownerOptions[${option.index}].quantity`;
                const valueKey = `:decrementOwnerQty_${option.index}`;

                updateExpression += `, ${optionKey} = ${optionKey} - ${valueKey}`;
                expressionAttributeNames['#ownerOptions'] = 'ownerOptions';
                expressionAttributeValues[valueKey] = coBuyingDetail.ownerOptions[option.index].quantity - option.optionQuantity;
            }
        });

    } else {
        // 인원 나눔 공구글에 대한 추가 업데이트
        // 인원 나눔은 신청자 수 기준이기 때문에 수량은 따로 증가시키지 않음
        updateExpression += ', #remainAttendeeCount = #remainAttendeeCount - :newAttendeeCount';
        expressionAttributeNames['#remainAttendeeCount'] = 'remainAttendeeCount';
        expressionAttributeValues[':newAttendeeCount'] = 1;

        // 공구장 가정산 수량 업데이트
        // 신청자가 구매하는 만큼 공구장 가정산 수량이 감소함
        updateExpression += ', #ownerQuantity = #ownerQuantity - :newAttendeeQuantity';
        expressionAttributeNames['#ownerQuantity'] = 'ownerQuantity';
        expressionAttributeValues[':newAttendeeQuantity'] = 1;
    }

    const param = {
        TableName: process.env.CoBuyingTableName || 'Dev-CoBuyingTable',
        Key: {
            ownerName: coBuyingDetail.ownerName,
            id: coBuyingDetail.id,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: ReturnValue.ALL_NEW,
    } as UpdateDynamoQuery;
    // console.log('query param', param);
    return param;
}

function validateApp(coBuyingDetail: CoBuyingDetail, app: ApplicationReq) {
    if (coBuyingDetail.type === DivideType.quantity) {
        validateQuantityApp(coBuyingDetail, app);
    } else {
        validateAttendeeApp(coBuyingDetail, app);
    }
}

function validateQuantityApp(coBuyingDetail: CoBuyingDetail, app: ApplicationReq) {
    if (!app.attendeeQuantity) {
        throw new APIERROR(400, '수량을 입력해주세요.');
    }
    // if (Math.round(app.attendeePrice) !== Math.round((coBuyingDetail as QuantityCoBuyingDetail).unitPrice * app.attendeeQuantity)) {
    //     throw new APIERROR(400, '신청 금액이 정확하지 않습니다. 단가와 수량을 확인해주세요.');
    // }
    const appItemOptions = app.itemOptions;
    const coBuyingItemOptions = (coBuyingDetail as QuantityCoBuyingDetail).itemOptions;

    appItemOptions?.forEach((itemOption) => {
        const coBuyingItemOption = coBuyingItemOptions?.find((coBuyingItemOption) => coBuyingItemOption.name === itemOption.name);
        if(!coBuyingItemOption) {
            throw new APIERROR(400, '신청 가능한 옵션이 아닙니다. '+itemOption.name);
        }
        if (itemOption.quantity > (coBuyingItemOption?.remainQuantity || 0)) {
            throw new APIERROR(400, '남은 수량보다 많은 수량을 신청할 수 없습니다.');
        }
    });

    if (app.attendeeQuantity > (coBuyingDetail as QuantityCoBuyingDetail).remainQuantity) {
        throw new APIERROR(400, '남은 수량보다 많은 수량을 신청할 수 없습니다.');
    }    
}

function validateAttendeeApp(coBuyingDetail: CoBuyingDetail, app: ApplicationReq) {
    if (app.attendeeQuantity !== 1) {
        throw new APIERROR(400, '인원 나눔은 1인당 1개만 신청 가능합니다.');
    }
    // if (Math.round(app.attendeePrice) !== Math.round((coBuyingDetail as AttendeeCoBuyingDetail).perAttendeePrice)) {
    //     throw new APIERROR(400, '신청 금액이 1인당 금액과 일치하지 않습니다.');
    // }
    if (app.attendeeQuantity > (coBuyingDetail as AttendeeCoBuyingDetail).remainAttendeeCount) {
        throw new APIERROR(400, '더 이상 신청할 수 없습니다. 남은 인원이 없습니다.');
    }
}

function getPerAttendeeQuantity(coBuyingDetail: AttendeeCoBuyingDetail): number {
    const perAttendeeQuantity = coBuyingDetail.totalQuantity / coBuyingDetail.targetAttendeeCount;
    return Math.floor(perAttendeeQuantity * 1000) / 1000;
}

