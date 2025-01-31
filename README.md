# nanum_back

### DynamoDB local에서 실행하기

`docker run -d -p 3300:8000 amazon/dynamodb-local` 로 도커 컨테이너 실행하기 `http://127.0.0.1:3300`로 접근 가능!
stage에 따라 prod는 aws 클라우드 DB를 호출하고 local은 로컬 도커 컨테이너로 실행 중인 DB를 호출한다.

`aws dynamodb create-table --cli-input-json file://./json/create-cobuying.json --endpoint-url http://localhost:3300` 로컬 DynamoDB에 테이블 만들기

`aws dynamodb list-tables --endpoint-url http://localhost:3300`으로 테이블 조회

`aws dynamodb scan --endpoint-url http://localhost:3300 --table-name CoBuyingTable --output json > output.json`


### DynamoDB Document Client

[DynamoDB Document SDK 꼭 참고하기](https://docs.aws.amazon.com/ko_kr/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)

### SAM 프로젝트 실행

`sam local start-api`

### S3에 템플릿 파일 업로드

`aws s3 cp infrastructure/tables.yaml s3://aws-sam-cli-managed-default-samclisourcebucket-wwnykfo1yoib/tables.yaml`


### 로컬에서 sam api 서버 실행

`sam local start-api --env-vars ./config/env-local.json`

### 콘솔에서 API Gateway와 Route 53 연동

- ACM 인증서 생성
- API Gateway 사용자 지정 도메인 생성
- API 맵핑 생성
- Route 53 A 레코드 생성
  - 트래픽 라우팅 대상을 API Gateway로 설정

# 스테이지 별 배포 방법

### 스테이지 환경 배포
sam deploy --template-file template-stage.yaml --stack-name nanum-back-stage

### 프로덕션 환경 배포
sam deploy --template-file template-prod.yaml --stack-name nanum-back-prod