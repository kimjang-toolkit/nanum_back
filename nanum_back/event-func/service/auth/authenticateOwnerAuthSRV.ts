import { APIERROR } from '@common/responseType';
import { queryCoBuyingOwnerById } from 'dao/cobuying/queryCoBuyingOwnerDAO';
import { verifyPassword } from '@auth/authEncrptorSRV';
import { AuthToken, CoBuyingOwnerAuth } from '@interface/auth';
import { generateToken } from '@auth/authEncrptorSRV';

export const authenticateOwnerAuthSRV = async (auth: CoBuyingOwnerAuth): Promise<AuthToken> => {
    // ownerName과 id로 password 해시 가져오기
    //      만약 존재하지 않는 공구글에 대한 값은 "정확한 공구글 정보를 알려주세요." 에러 메시지 전달. 404 에러
    let owner: CoBuyingOwnerAuth;
    try {
        owner = await queryCoBuyingOwnerById(auth.coBuyingId, auth.ownerName);
    } catch (error) {
        throw new APIERROR(404, '정확한 공구글 정보를 알려주세요.');
    }

    // 가져온 password 해시와 auth의 password를 비교
    //      인증 안되면 "정확한 비밀번호를 입력해주세요." 400 에러 발생
    const result = verifyPassword(auth.ownerPassword, owner.ownerPassword);
    if (!result) {
        throw new APIERROR(401, '정확한 비밀번호를 입력해주세요.');
    } else {
        // 인증되면, JWT를 생성해서 리턴.
        const token = generateToken(owner);
        return token;
    }
};
