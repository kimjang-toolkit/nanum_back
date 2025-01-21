import { CoBuyingStatus } from '@domain/cobuying';
import { CoBuyingSimple } from '@interface/cobuying';

export function mapToCoBuyingSimple(res: any): CoBuyingSimple[] {
    return res.Items.map((item: any) => ({
        id: item.id.S, // `id` 필드는 `S`로 저장됨
        status: item.status ? CoBuyingStatus[item.status.S] : CoBuyingStatus.PREPARING, // 상태는 가정에 맞게 처리
        totalPrice: item.totalPrice ? parseFloat(item.totalPrice.N) : 0, // `totalPrice` 필드가 숫자일 경우
        attendeeCount: item.attendeeCount ? parseInt(item.attendeeCount.N, 10) : 0, // `attendeeCount`가 숫자로 저장됨
        productName: item.productName ? item.productName.S : '', // `productName` 문자열 필드
        ownerName: item.ownerName ? item.ownerName.S : '', // `ownerName` 필드
        deadline: item.deadline ? item.deadline.S : '', // `deadline` 필드가 문자열로 저장됨
        createdAt: item.createdAt.S, // `createdAt` 필드가 ISO 8601 문자열로 저장됨
    }));
}
