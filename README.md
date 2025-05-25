# nanum_back

## 6각형 아키텍처 적용

### 컴포넌트 별 역할

- 비즈니스 로직을 호출하는 Inbound Adapter(Consumer, RestAPI, RPC, RMI, ...) 
  - control은 Lambda evnet source에서 발생한 요청을 받아드리는 어댑터
  - consumer는 SQS, SNS에서 발생한 요청을 받아드리는 어댑터
- 외부 서비스를 호출하는 Outbound Adapter(Publisher, RestAPI, Repository, ...)
- 비즈니스 로직이 있는 Application Layer(Lambda)
- 서비스 간 이벤트 전달하는 메시지 브로커(Kafka, SQS, SNS, ...)
- 분산 환경에서 ACD 트랜잭션을 구현하는 Saga (오케스트레이션 방식은 러닝커브가 있어서 코레오그래피 방식으로 구현)
  - 각 서비스의 SagaManager가 보상 가능 트랜잭션, 피봇 트랜잭션, 재시도 가능 트랜잭션 순서를 관리함.
- mapper는 adapter의 이벤트나 응답을 service에 보낼 수 있도록 셋팅해주는 컴포넌트

### 공구글 생성 서비스로 보는 코레오그래피 사가 순서도

1. 클라이언트가 공구글 생성을 요청
2. 공구서비스가 CREADTE_PENDING 상태로 공구글을 생성 (Semantic lock)
  
### 도메인

- cobuying : 공구글 원장을 관리하는 서비스
- manage : 공구글 운영 관리 서비스
- product : 상품, 태그 관리 서비스
- user : 유저, 인증 관리 서비스
- common : CTL 출력 DTO 관리, Time 관리 등
- connect : AI, DB, Facebook, Lambda, S3 연결 클랑이언트 생성

## CICD 구성

Feature branch에서 작업 후 Stg 브랜치에 병합 시 Stg-nanum-back 스택 배포

Prod 브랜치에 Stg 브랜치 병합 시 Prod-nanum-back 스택 배포

Prod는 Stg 브랜치만 병합 가능

### DynamoDB local에서 실행하기

`docker run -d -p 3300:8000 amazon/dynamodb-local` 로 도커 컨테이너 실행하기 `http://127.0.0.1:3300`로 접근 가능!
stage에 따라 prod는 aws 클라우드 DB를 호출하고 local은 로컬 도커 컨테이너로 실행 중인 DB를 호출한다.

`aws dynamodb create-table --cli-input-json file://./json/create-cobuying.json --endpoint-url http://localhost:3300`
`aws dynamodb create-table --cli-input-json file://./json/create-user.json --endpoint-url http://localhost:3300`

 로컬 DynamoDB에 테이블 만들기

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

### 개발 환경 배포

`sam deploy --no-confirm-changeset` 일단 기본 api.gonggong99.store 도메인으로 배포...
Stg, Prod 배포가 안정화되면 그때 도메인 변경 및 배포 추가

### 스테이지 환경 배포
  `sam deploy --config-env Stg --stack-name Stg-nanum-back`

### 프로덕션 환경 배포
  `sam deploy --config-env Prod --stack-name Prod-nanum-back`

### 리소스 수정 시 주의할 점

- 한 리소스는 하나의 변경사항만 적용.
- 여러 리소스를 동시에 수정은 가능하지만, **꼭 리소스 당 하나의 변경사항**만 적용.
- 인덱스 삭제 후 새로운 인덱스 생성 시 기존 인덱스 삭제 후 새로운 인덱스 생성 필요



## 이미지 크롭핑 함수 배포
### sharp 배포를 위해 컨테이너 빌드 방법

npm install --platform=linux --arch=x64 sharp@0.32.6
```
cd lambda-s3
zip -r function.zip .
```

function.zip 파일을 람다 함수로 배포

aws lambda update-function-code  --function-name Dev-convertOrigin2Thumbnail --zip-file fileb://function.zip --region ap-northeast-2
