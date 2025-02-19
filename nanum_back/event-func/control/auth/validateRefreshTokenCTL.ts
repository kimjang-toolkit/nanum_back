import { refreshAuthenticate } from './../../service/auth/refreshAuthenticateSRV';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR } from 'common/responseType';
import { validateTokenSRV } from '@auth/validateTokenSRV';
import { LambdaReturnDto } from 'dto/LambdaReturnDto';
import { AuthToken, CookieOptions, HeaderOptions, TokenName, UserAuthDto } from '@interface/auth';

/**
 * 
 * 토큰 검증
 * 
 * Get
 * {domain}/api/refresh
 * 
 * @param event 
 * @returns 
 */
export const validateRefreshTokenCTL = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let token: string;
    try {
        token = validateInput(event);
    } catch (error) {
        return new LambdaReturnDto(401, { message: (error as Error).message }, event).getLambdaReturnDto();
    }

    try {
        // 토큰 기반 사용자 인증
        const authToken : AuthToken = await validateTokenSRV(token);
        // httpOnly로 refreshToken을 쿠키에 setting
        const refreshCookieOptions: CookieOptions = {
            SameSite: 'None',
            'Max-Age': 604800,
            Path: '/',
            cookies : {
                [TokenName.refreshToken] : authToken.refreshToken
            }
        };

        const headerOptions: HeaderOptions = {
            Authorization: `Bearer ${authToken.accessToken}`,
        };

        if(!authToken.user){
            throw new APIERROR(401, '옳바르지 않은 인증 정보입니다. 다시 로그인해주세요.');
        }

        const lamdbdaReturnDto = new LambdaReturnDto(200, {
            ownerName: authToken.user.ownerName,
            coBuyingId: authToken.user.coBuyingId,
        } as UserAuthDto, event, headerOptions,refreshCookieOptions);

        // console.log('tobe headers : ', lamdbdaReturnDto.getLambdaReturnDto().headers);
    
        return lamdbdaReturnDto.getLambdaReturnDto();
    } catch (error) {
        if (error instanceof APIERROR) {
            return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
        }
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
};


function extractLatestRefreshToken(event: APIGatewayProxyEvent): string | null {
    let refreshToken: string | null = null;
    // console.log('event.headers.Cookie : ', event.headers.Cookie);
    // 1️⃣ `cookies` 배열에서 최신 `GongGong99-RefreshToken` 찾기
    if (event.headers.Cookie) {
        console.log('event 검사 시작!')
        const cookies: string[] = event.headers.Cookie.split(';');
        console.log('cookies : ', cookies);
        const refreshToken = cookies.find(cookie => cookie.startsWith(`${TokenName.refreshToken}=`));
        console.log('refreshToken : ', refreshToken);
        return refreshToken ? refreshToken.split('=')[1] : null;        
    }

    return refreshToken;
}


function validateInput(event: APIGatewayProxyEvent): string {
    try {
        // console.log('event : ', event);
        const refreshAuthenticate = extractLatestRefreshToken(event);
        if (!refreshAuthenticate) {
            throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
        }
        console.log('refresh token 추출 성공!');
        return refreshAuthenticate;
    } catch (error) {
        throw new APIERROR(401, '정확한 인증 정보를 전달해주세요.');
    }
}