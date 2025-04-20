import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { APIERROR} from '@common/responseType';
import { authenticateOwnerAuthSRV } from '@auth/service/authenticateOwnerAuthSRV';
import { AuthToken, CoBuyingOwnerAuth, CookieOptions, HeaderOptions, TokenName, UserAuthDto } from '@interface/auth';
import { LambdaReturnDto } from '@common/LambdaReturnDto';
const validateInput = (event: APIGatewayProxyEventV2): CoBuyingOwnerAuth => {
    const coBuyingId = event.pathParameters?.coBuyingId;
    const { ownerName, ownerPassword } = JSON.parse(event.body || '');
    if (!ownerName || !ownerPassword || !coBuyingId) {
        throw Error('정확한 인증 정보를 전달해주세요.');
    }
    return {
        ownerName: ownerName,
        ownerPassword: ownerPassword,
        coBuyingId: coBuyingId,
    } as CoBuyingOwnerAuth;
};

/**
 * 단건의 coBuying을 조회한다. => 상세페이지 조회
 * 
 * Post
 * {domain}/api/co-buying/auth/{cobuyingId}
 * 
 * @param {APIGatewayProxyEventV2} event - API Gateway 이벤트 객체
 * @pathParam {string} coBuyingId - 공구 ID
 * @requestBody {object} requestBody - 요청 본문
 * @requestBody {string} requestBody.ownerName - 공구장 이름
 * @requestBody {string} requestBody.ownerPassword - 공구장 비밀번호
 * @returns {object} response - 응답 객체
 * @returns {string} response.message - 응답 메시지
 */
export const authenticateOwnerAuth = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    let auth: CoBuyingOwnerAuth;
    console.log('event : ', event);
    try {
        auth = validateInput(event);
    } catch (error) {
        // return {
        //     statusCode: 400,
        //     headers: BaseHeader,
        //     body: JSON.stringify({ message: (error as Error).message }),
        // };
        return new LambdaReturnDto(400, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
    try {
        // console.log('auth : ', auth);
        const jwt: AuthToken = await authenticateOwnerAuthSRV(auth);

        // httpOnly로 refreshToken을 쿠키에 setting
        const refreshCookieOptions: CookieOptions = {
            SameSite: 'None',
            'Max-Age': 604800,
            Path: '/',
            cookies : {
                [TokenName.refreshToken] : jwt.refreshToken
            }
        };

        const headerOptions: HeaderOptions = {
            Authorization: `Bearer ${jwt.accessToken}`,
        };
        const userAuthDto: UserAuthDto = {
            ownerName: auth.ownerName,
            coBuyingId: auth.coBuyingId,
        }
        const lamdbdaReturnDto = new LambdaReturnDto(200, userAuthDto, event, headerOptions, refreshCookieOptions);

        // console.log('tobe headers : ', lamdbdaReturnDto.getLambdaReturnDto().headers);
        console.log('tobe headers : ', lamdbdaReturnDto.getLambdaReturnDto().headers);
        return lamdbdaReturnDto.getLambdaReturnDto();
    } catch (error) {
        if (error instanceof APIERROR) {
            return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
        }
        return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
    }
};
