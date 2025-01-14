type Header = {
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Origin': string; // Allow from anywhere
    'Access-Control-Allow-Methods': string; // Allow only POST request
};

export interface APIERROR extends Error {
    statusCode: number;
    headers: Header;
    body: string;
}

export interface ApiResponse {
    statusCode: number;
    headers: Header;
    body: string;
}

export const BaseHeader = {
    'Access-Control-Allow-Headers': "'POST, GET, PUT, DELETE, OPTIONS'",
    'Access-Control-Allow-Origin': "'*'", // Allow from anywhere
    'Access-Control-Allow-Methods': "'Content-Type, Authorization, X-Forwarded-For, X-Api-Key, X-Amz-Security-Token'", // Allow only POST request
};

export const CoBuyingNotFoundERROR = {
    statusCode: 404,
    headers: BaseHeader,
    body: JSON.stringify({ message: '찾으시는 공구글이 없어요.' }),
} as APIERROR;
