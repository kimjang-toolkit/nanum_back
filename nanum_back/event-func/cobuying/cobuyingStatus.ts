export enum CoBuyingStatus {
    PREPARING = 0, // 공구 준비 중
    APPLYING = 1, // 공구 신청 중
    CLOSED = 2, // 공구 신청 마감
    ORDER_COMPLETE = 3, // 주문 완료
    SHARING = 4, // 나눔 중
    SHARING_COMPLETE = 5, // 나눔 완료
    DELIVERING = 6, // 배송 중
    CANCELLED = 7, // 취소됨
}
