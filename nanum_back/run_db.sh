
# dynamodb 컨테이너 실행
docker run -d -p 3300:8000 amazon/dynamodb-local

# 테이블 삭제
aws dynamodb delete-table --table-name CoBuyingTable --endpoint-url http://localhost:3300

# 테이블 생성
aws dynamodb create-table --cli-input-json file://./json/create-cobuying.json --endpoint-url http://localhost:3300

aws dynamodb create-table --cli-input-json file://./json/create-user.json --endpoint-url http://localhost:3300

# 테이블 설명
aws dynamodb describe-table --table-name Dev-CoBuyingTable --endpoint-url http://localhost:3300
aws dynamodb describe-table --table-name Dev-UserTable --endpoint-url http://localhost:3300



