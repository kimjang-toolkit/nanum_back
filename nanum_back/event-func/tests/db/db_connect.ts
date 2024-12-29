import AWS from 'aws-sdk';

// 환경 변수 설정 (로컬 DynamoDB URL)
process.env.DYNAMO_DB_URL = 'http://localhost:8000';
process.env.AWS_REGION = 'ap-northeast-2'; // 리전 설정

// DynamoDB DocumentClient 초기화
const dynamoDB = new AWS.DynamoDB({
    endpoint: process.env.DYNAMO_DB_URL,
    region: process.env.AWS_REGION,
});

// 테이블 상태를 확인하는 함수
const checkTableStatus = async (tableName: string) => {
    try {
        // describeTable을 사용하여 테이블 정보를 조회
        const result = await dynamoDB.describeTable({ TableName: tableName }).promise();
        console.log('테이블 상태:', result.Table);
        return result.Table;
    } catch (error) {
        console.error('테이블 상태 조회 중 오류 발생:', error);
        throw new Error('테이블 상태 조회 실패');
    }
};

// 예시: 'YourTableName' 테이블 상태 확인
const testFunction = async () => {
    const tableName = 'YourTableName'; // 확인할 테이블 이름
    try {
        const tableStatus = await checkTableStatus(tableName);
        console.log(`테이블 ${tableName} 상태:`, tableStatus);
    } catch (error) {
        console.error('테스트 실패:', error);
    }
};

console.log('DynamoDB URL:', process.env.DYNAMO_DB_URL);
console.log('Region: ', process.env.AWS_REGION);
// 테스트 실행
testFunction();
