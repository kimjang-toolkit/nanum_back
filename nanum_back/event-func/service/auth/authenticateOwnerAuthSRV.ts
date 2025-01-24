import { CoBuyingOwnerAuth } from '@domain/user';

export const saveCoBuying = async (auth: CoBuyingOwnerAuth): Promise<void> => {
    // ownerName과 id로 password 해시 가져오기
    //      만약 존재하지 않는 공구글에 대한 값은 "정확한 공구글 정보를 알려주세요."
    // 가져온 password 해시와 auth의 password를 비교
    // 인증되면, JWT를 생성해서 리턴.
};
