interface CoBuyingSimple {
    id: string;
    productName: string;
    ownerName: string;
    deadline: string; // ISO 8601 format
    createdAt: string; // ISO 8601 format
}

interface BaseCoBuying {
    id: string;                         // 공구글 고유 ID
    productName: string;                // 공구 상품 이름
    productLink?: string;               // 공구 상품 링크 (선택적)
    ownerName: string;                  // 공구장 이름
    totalPrice: number;                 // 공구 상품 총액
    attendeeCount: number;              // 공구 신청자 수
    deadline: string;                   // 신청 마감일 (ISO 8601 형식)
    type: 'quantity' | 'attendee';      // 공구글 타입 ('quantity' - 수량 나눔, 'attendee' - 인원 나눔)
    memo?: string;                      // 메모 또는 알림말 (선택적)
    attendeeList: Attendee[];           // 신청자 리스트
  }
  
interface QuantityCoBuying extends BaseCoBuying {
    type: 'quantity';                   // 공구글 타입 ('quantity' - 수량 나눔)
    totalQuantity: number;              // 구매할 상품의 총 수량
    ownerQuantity: number;              // 공구장이 구매할 수량
    ownerPrice: number;                 // 공구장이 부담할 금액
    totalAttendeePrice: number;         // 신청자들이 부담하는 총 금액
    totalAttendeeQuantity: number;      // 신청자들의 총 구매 수량
    unitPrice: number;                  // 상품 개당 가격
}

interface AttendeeCoBuying extends BaseCoBuying {
    type: 'attendee';                   // 공구글 타입 ('attendee' - 인원 나눔)
    planAttendeeCount: number;          // 목표 신청자 수
    perAttendeePrice: number;           // 신청자 1인당 부담 금액
}

type CoBuyingPost = QuantityCoBuying | AttendeeCoBuying; // 수량 나눔 또는 인원 나눔 타입 중 하나의 공구글
