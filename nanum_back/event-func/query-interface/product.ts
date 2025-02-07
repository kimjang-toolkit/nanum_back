export const header = {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    Cookie: 'x-coupang-origin-region=KOREA; x-coupang-target-market=KR;',
    'Sec-Ch-Ua-Platform': 'macOS',
    'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    Referer: 'https://www.coupang.com/',
    'Sec-Ch-Ua': 'Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Host': 'www.coupang.com',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
};

export const cookies = [
    {
        name: 'x-coupang-accept-language',
        value: 'ko-KR',
        domain: '.coupang.com',
    },
    {
        name: 'x-coupang-target-market',
        value: 'KR',
        domain: '.coupang.com',
    },
    {
        name: 'x-coupang-origin-region',
        value: 'KOREA',
        domain: '.coupang.com',
    },
    {
        name: 'sid',
        value: '1beb9ee8c40f44678e387aaf351e0605454d3439',
        domain: '.coupang.com',
    },
];
