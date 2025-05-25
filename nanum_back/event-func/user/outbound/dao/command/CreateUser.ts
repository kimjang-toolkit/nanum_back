import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIERROR } from '@common/responseType';
import { SaveUserQueryDto } from '@user/dto/SaveUserQueryDto';

export class CreateUser {
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(saveUserQuery: SaveUserQueryDto): Promise<void> {
    try{
      const command = new PutCommand({
        ...saveUserQuery,
      });
      await this.client.send(command);
    } catch (error) {
      throw new APIERROR(500, '유저 데이터 저장 실패 '+ (error as Error).message);
    }
  }
}