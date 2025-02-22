import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { LambdaReturnDto } from "dto/LambdaReturnDto";

/**
 * 
 * 공구종료
 * ### 요구사항

1. 공구장 인증
2. 공구장이 모임을 마감 => 공구글 상태 변경 (마감[normal], 취소[cancel])[endStatus]
3. 공구글 타입에 따라 신청자들의 부담액을 배정 (소수점 발생하지 않도록 조심!!)
4. 공구 나눔 정보 입력
6. 신청자들에대한 나눔현황 리스트를 생성해야함. => 신청현황 리스트에 나눔완료유무 등을 덧붙이면 될듯!

## 정상 마감

### 수량 나눔 부담액 배정 방식

- 총 수량과 총 신청 수량이 같은 경우
    - 수량따라 부담액 산정
- 다른 경우
    - 총 수량과 총 신청 수량 차이만큼 공구장에게 배정 
    - 따라서 공구장의 신청 수량 = 기존 신청 수량 + (총 수량 - 총 신청 수량)

- **총 가격이 총 신청 수량으로 나눠떨어지는 경우**
    - 수량당 가격 = 총 가격 / 신청 수량
- **나눠떨어지지 않는 경우**
    - 수량당 가격 = ceil(총 가격 / 총 신청 수량) 
    - 신청자 부담액 = 신청 수량 * 수량당 가격
    - 공구장 수량당 가격 =  총 가격 - 총 신청자 부담액


### 인원 나눔 부담액 배정 방식

- 목표 인원이 총 신청 인원과 같은 경우
    - 인원 따라 부담액 산정
- 다른 경우
    - 공구장의 인원 = (목표 인원 - 총 신청 인원)

- **총 가격이 총신청인원으로 나눠떨어지는 경우**
    - 인당 가격 = 총가격 / 총신청인원
- **나눠떨어지지 않는 경우**
    - 인당 가격 = ceil(총가격 / 총신청인원)
    - 신청자 부담액 = 인당가격
    - 공구장 부담액 = 총가격 - 총 신청자 부담액

## 취소 마감

- 공구장이 취소 마감을 선택한 경우
    - 공구글의 상태를 취소로 변경하고 더 이상 신청 받지 않음


 * @param event 
 * Put: {domain}/api/co-buying/end/{coBuyingId}?endStatus={endStatus}&ownerName={ownerName}
 * 
 * Required: Authorization header
 * 
 * @returns 
 */
export const coBuyingEndHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    return new LambdaReturnDto(200, { message: '코뮤니티 구매 종료' }, event).getLambdaReturnDto();
};

/**
 * ## cobuying 종료 입력값 검증
 * 입력값을 바탕으로 존재하는 공구글인지 확인
 * endStatus 값이 normal 또는 cancel 인지 확인
 * 
 * @param event 
 */
const validateInput = (event: APIGatewayProxyEventV2): void => {
    const coBuyingId = event.pathParameters?.coBuyingId;
    if (!coBuyingId) {
        throw new Error('공구글 ID가 없습니다.');
    }
};
