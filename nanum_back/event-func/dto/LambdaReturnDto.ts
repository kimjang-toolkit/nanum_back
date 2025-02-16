// class 형식으로 반환하는 타입

import { APIGatewayProxyEvent } from "aws-lambda";

export class HeaderDto {
  headers : Record<string, string>;

  // 이니셜라이저 추가
  constructor(headers: Record<string, string>) {
    this.headers = headers;
  }
}

export class LambdaReturnDto {
    statusCode: number;
    headers: HeaderDto;
    body: any;

  // 이니셜라이저 추가
  constructor(statusCode: number, headers: HeaderDto, body: any) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
  }

  // event 받고 Domain을 설정하는 이니셜라이저 추가
  constructor(event: APIGatewayProxyEvent, statusCode: number, headers: HeaderDto, body: any) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
  }
}
