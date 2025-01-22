import { CoBuyingStatus } from '@domain/cobuying';
import { CoBuyingDetail, CoBuyingKey, CoBuyingSimple } from '@interface/cobuying';

export function mapToCoBuyingSimple(res: any): CoBuyingSimple[] {
    // res.Items가 undefined인 경우 빈 배열을 반환하도록 수정
    return (res || []).map((item: any) => ({
        id: item.id.S, // `id` 필드는 `S`로 저장됨
        coBuyingStatus: item.coBuyingStatus ? CoBuyingStatus[item.coBuyingStatus.N] : CoBuyingStatus.PREPARING, // 상태는 가정에 맞게 처리
        totalPrice: item.totalPrice ? parseFloat(item.totalPrice.N) : 0, // `totalPrice` 필드가 숫자일 경우
        attendeeCount: item.attendeeCount ? parseInt(item.attendeeCount.N, 10) : 0, // `attendeeCount`가 숫자로 저장됨
        productName: item.productName ? item.productName.S : '', // `productName` 문자열 필드
        ownerName: item.ownerName ? item.ownerName.S : '', // `ownerName` 필드
        deadline: item.deadline ? item.deadline.S : '', // `deadline` 필드가 문자열로 저장됨
        createdAt: item.createdAt.S, // `createdAt`
    }));
}

export function mapToCoBuyingEvaluatedKey(req: any): CoBuyingKey {
    if (req.createdAt) {
        // createdAt이 존재하면 CreatedAtKey로 매핑
        return {
            id: req.id.S,
            key: 'createdAt',
            createdAt: req.createdAt.S,
        };
    } else if (req.deadline) {
        // createdAt이 없고 deadline이 존재하면 DeadlineKey로 매핑
        return {
            id: req.id.S,
            key: 'deadline',
            deadline: req.deadline.S,
        };
    } else {
        // 두 필드가 모두 없으면 오류 처리 혹은 적절한 기본값 설정
        throw new Error('Invalid LastEvaluatedKey: Missing createdAt or deadline');
    }
}
