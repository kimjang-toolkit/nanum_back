import { CoBuyingOwnerAuth } from '@domain/user';
import { queryCoBuyingById } from '@cobuying/queryCoBuyingOneDAO';
import { APIERROR } from '@common/responseType';
import { queryCoBuyingPasswordById } from '@cobuying/queryCoBuyingPasswordDAO';
import { verifyPassword } from '@auth/authEncrptorSRV';

export const authenticateOwnerAuthSRV = async (auth: CoBuyingOwnerAuth): Promise<void> => {
    // ownerName과 id로 password 해시 가져오기
    //      만약 존재하지 않는 공구글에 대한 값은 "정확한 공구글 정보를 알려주세요." 에러 메시지 전달. 404 에러
    let stordPassword;
    try {
        stordPassword = await queryCoBuyingPasswordById(auth.id, auth.ownerName);
    } catch (error) {
        throw new APIERROR(404, '정확한 공구글 정보를 알려주세요.');
    }

    // 가져온 password 해시와 auth의 password를 비교
    //      인증 안되면 "정확한 비밀번호를 입력해주세요." 400 에러 발생

    try{
        await verifyPassword(auth.password, stordPassword);
    }
    // 인증되면, JWT를 생성해서 리턴.
};
