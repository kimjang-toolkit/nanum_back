// class 형식으로 반환하는 타입

import { CookieOptions, HeaderOptions } from "@interface/auth";
import { APIGatewayProxyEventV2 } from "aws-lambda";

export class HeaderDto {
  // domain: string;
  headers : Record<string, string>;

  // 이니셜라이저 추가
  constructor(domain?: string, headerOptions?: HeaderOptions) {
    // this.domain = domain;
    if(domain) {
      this.headers = {
        'Access-Control-Allow-Headers':
          'Content-Type, Set-Cookie, x-amzn-Remapped-Authorization, Authorization, X-Forwarded-For, X-Api-Key, X-Amz-Security-Token, GongGong99-AccessToken, GongGong99-RefreshToken',
        'Access-Control-Allow-Origin': domain, // Allow from anywhere
        'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS', // Allow only GET request
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Expose-Headers':
          'Content-Type, x-amzn-Remapped-Authorization, Authorization, X-Forwarded-For, X-Api-Key, X-Amz-Security-Token, GongGong99-AccessToken, GongGong99-RefreshToken, Set-Cookie',
      };
      if(headerOptions?.Authorization) {
        this.headers['Authorization'] = `${headerOptions.Authorization}`;
      }
    } else { // 도메인 없으면 빈 객체 생성
      this.headers = {}
    }
  }

  setCookies(cookieOptions: CookieOptions) {
    const setCookies = [
      `HttpOnly; Secure; 
        ${Object.entries(cookieOptions)
          .filter(([key, value]) => key !== 'cookies') // cookies 제외 쿠키 옵션 쿠가
          .map(([key, value]) => `${key}=${value}`)
          .join('; ')}`,
    ];

    if(cookieOptions.cookies) {
      setCookies.push(...Object.entries(cookieOptions.cookies)
        .map(([key, value]) => `${key}=${value}`).join('; '));
    }

    this.headers['Set-Cookie'] = setCookies.join(', ');
  }

  // 헤더 리턴
  getHeaders() {
    return this.headers;
  }
}

/**
 * 허용된 도메인에 한해서 CORS 헤더를 추가하고 응답 객체를 반환하는 클래스
 * 도메인별 CORS 헤더 셋팅을 위해서 클래스 생성
 * HeaderOptions 타입의 인자를 받아서 헤더 셋팅
 *  주로 인증 관련 헤더 셋팅에 사용
 * CookieOptions 타입의 인자를 받아서 쿠키 셋팅
 *  주로 인증 관련 쿠키 셋팅에 사용
 */
export class LambdaReturnDto {
    statusCode: number;
    headers: HeaderDto;
    body: string;

  // 이니셜라이저 추가
  constructor(statusCode: number, body: any, event?: APIGatewayProxyEventV2, headerOptions?: HeaderOptions, cookieOptions?: CookieOptions) {
    this.statusCode = statusCode;
    if(event?.headers?.Origin) { // 람다를 요청한 도메인을 CORS 헤더에 추가
      // Construct full domain
      const fullDomain = event.headers.Origin;
      console.log('Full Domain:', fullDomain);
      this.headers = new HeaderDto(fullDomain, headerOptions);

      if(cookieOptions) {
        this.headers.setCookies(cookieOptions);
      }
    } else { // 도메인이 없으면 빈 헤더 사용
      this.headers = new HeaderDto('https://gonggong99.store', headerOptions);
    }
    this.body = JSON.stringify(body);
  }

  // 람다 응답 객체 반환
  getLambdaReturnDto() {
    return {
      statusCode: this.statusCode,
      headers: this.headers.getHeaders(),
      body: this.body,
    };
  }
}
