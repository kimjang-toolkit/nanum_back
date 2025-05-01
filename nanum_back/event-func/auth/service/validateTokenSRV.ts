import { extractPayload, regenerateToken } from '@auth/service/authEncrptorSRV';
import { queryCoBuyingById } from '@cobuying/dao/queryCoBuyingOneDAO';
import { AuthToken, OwnerUserAuthDTO } from '@interface/auth';
import { CoBuyingSummary } from '@interface/cobuying';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { APIERROR } from '@common/responseType';
import { JwtPayload } from 'jsonwebtoken';

export const validateTokenSRV = async (token: string): Promise<OwnerUserAuthDTO> => {
    // let userAuth: UserAuth;

    // token 유효성 검증
    const tokenValide: JwtPayload = extractPayload(token);
    if (!tokenValide) {
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
    const decodedOwnerName = tokenValide.ownerName as string;
    const decodedCoBuyingId = tokenValide.coBuyingId as string;
    console.log('jwt 정보 추출 성공!  name: ', decodedOwnerName, ' id: ', decodedCoBuyingId);
    // 토큰 정보가 비어있는지 검증
    if (!decodedOwnerName || !decodedCoBuyingId) {
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
    let cobuying: CoBuyingSummary;
    try{
        cobuying = await queryCoBuyingById(decodedOwnerName, decodedCoBuyingId);
    }catch(error){
        if(error instanceof APIERROR){
            throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요. '+error.message);
        }
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
    // console.log('cobuying 조회 성공!  name: ', cobuying.ownerName, ' id: ', cobuying.id);
    if(cobuying.ownerName !== decodedOwnerName || cobuying.id !== decodedCoBuyingId){
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }

    const userAuth: OwnerUserAuthDTO = {
        ownerName: cobuying.ownerName,
        coBuyingId: cobuying.id,
    } as OwnerUserAuthDTO;


    // const authToken: AuthToken = regenerateToken(userAuth);
    // token 정보로 공구글 조회 성공 시 토큰 인증 성공!
    console.log('토큰 인증 성공');
    return userAuth;
};

export const extractTokenFromHeader = (event: APIGatewayProxyEventV2): string => {
    console.log('event : ', event);
    const token = event.headers.Authorization?.split(' ')[1] || event.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
    }
    return token;
}

export const validateCobuyingTokenFromHeader = async (event: APIGatewayProxyEventV2): Promise<OwnerUserAuthDTO> => {
    const token = extractTokenFromHeader(event);
    return validateTokenSRV(token);
}

// export const validateUserTokenSRV(token)

// export const validateUserTokenFromHeader = async (event: APIGatewayProxyEventV2): Promise<OwnerUserAuthDTO> => {
//     const token = extractTokenFromHeader(event);
//     return validateUserTokenSRV(token);
// }