export interface CoBuyingCreateReq {
    productName: string; // 공구글의 이름
    totalPrice: number; // 공구할 상품 총액
    productLink?: string; // 제품 링크 (optional)
    deadline: string; // 신청 마감일 (ISO 8601 형식)
    type: 'quantity' | 'attendee'; // 공구글 타입: 수량 나눔 또는 인원 나눔
    totalQuantity: number; // 구매할 제품의 총 수량
    ownerQuantity?: number; // 공구장이 구매할 제품 수량 (type이 'quantity'일 경우 필수)
    unitPrice?: number; // 개당 가격 (type이 'quantity'일 경우 필수)
    planAttendeeCount?: number; // 목표 신청자 수 (type이 'attendee'일 경우 필수)
    perAttendeePrice?: number; // 신청자 1인 당 부담액 (type이 'attendee'일 경우 필수)
    memo?: string; // 공구글 알림말 (optional)
    ownerName: string; // 공구장 이름
    ownerPwd: string; // 공구 비밀번호
}

export interface CoBuyingCreateRes {
    id: string;
    productName: string;
    ownerName: string;
    deadline: string;
    createdAt: string;
}
