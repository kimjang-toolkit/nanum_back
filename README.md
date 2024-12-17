# nanum_back

### DynamoDB local에서 실행하기

`docker run -p 3000:8000 amazon/dynamodb-local` 로 도커 컨테이너 실행하기
stage에 따라 prod는 aws 클라우드 DB를 호출하고 local은 로컬 도커 컨테이너로 실행 중인 DB를 호출한다.

`aws dynamodb create-table --cli-input-json file://./json/create-person.json --endpoint-url http://localhost:8000` 로컬 DynamoDB에 테이블 만들기

### DynamoDB Document Client

[DynamoDB Document SDK 꼭 참고하기](https://docs.aws.amazon.com/ko_kr/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)

### S3에 템플릿 파일 업로드

`aws s3 cp infrastructure/tables.yaml s3://aws-sam-cli-managed-default-samclisourcebucket-wwnykfo1yoib/tables.yaml`

