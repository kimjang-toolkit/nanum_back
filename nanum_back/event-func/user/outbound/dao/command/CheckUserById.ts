import { DynamoDBDocument, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIERROR } from "@common/responseType";

export class CheckUserById {
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(id: string, tableName: string): Promise<void> {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: { id: id }
      });
      
      const result = await this.client.send(command);
      
      // Item이 존재하면 중복 에러 발생
      if (result.Item) {
        throw new APIERROR(400, '이미 존재하는 아이디입니다. 다른 아이디를 사용해주세요.');
      }
      
      // Item이 없으면 정상 처리 (회원가입 가능)
      return;
    } catch (error) {
      if (error instanceof APIERROR) {
        throw error; // 이미 APIERROR면 그대로 전파
      }
      // 그 외 에러는 서버 에러로 처리
      throw new APIERROR(500, '유저 조회 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }
}