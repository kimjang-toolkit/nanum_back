import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CreateDynamoDBCommandDto, CreateDynamoDBCommandFactory } from '@common/dynamodb';
import { APIERROR } from '@common/responseType';
import { UserMaster } from '@domain/user';

export class CreateUser {
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(userMaster: UserMaster, tableName: string): Promise<void> {
    // 4. 저장 실행
    const saveQuery = new CreateDynamoDBCommandFactory<UserMaster>()
      .setTableName(tableName)
      .setItem(userMaster)
      .build();
    try{
      const command = new PutCommand({
        ...saveQuery,
      });
      await this.client.send(command);
    } catch (error) {
      throw new APIERROR(500, '유저 데이터 저장 실패 '+ (error as Error).message);
    }
  }
}