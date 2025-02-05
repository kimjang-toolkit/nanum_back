type Header = {
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Origin': string; // Allow from anywhere
    'Access-Control-Allow-Methods': string; // Allow only POST request
};

export class APIERROR extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message); // Error 클래스의 message 속성 설정
        this.statusCode = statusCode;

        // Error 객체와 상속된 클래스의 프로토타입 연결
        Object.setPrototypeOf(this, APIERROR.prototype);
    }
}

export interface ApiResponse {
    statusCode: number;
    headers: Header;
    body: string;
}

export const BaseHeader = {
    'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Forwarded-For, X-Api-Key, X-Amz-Security-Token, GongGong99-AccessToken, GongGong99-RefreshToken',
    'Access-Control-Allow-Origin': process.env.DOMAINNAME || 'https://gonggong99.store', // Allow from anywhere
    'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS', // Allow only GET request
};

export const AuthSuccessHeader = {
    ...BaseHeader,
    'Access-Control-Allow-Credentials': 'true',
};
