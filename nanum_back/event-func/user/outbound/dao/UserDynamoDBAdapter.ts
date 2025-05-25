import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { IUserRepository } from './IUserRepository';
import { DynamoDBClientFactory } from '@common/dynamodb';
import { CreateUser } from '@user/outbound/dao/command/CreateUser';
import { SaveUserQueryDto } from '@user/dto/SaveUserQueryDto';

/**
 * DynamoDB 구현체를 사용하는 CoBuying 데이터 저장소 어댑터
 */
export class UserDynamoDBAdapter implements IUserRepository {
  private readonly client: DynamoDBDocument;
  private readonly createUserHandler: CreateUser;

  constructor() {
    this.client = DynamoDBClientFactory.getInstance();
    this.createUserHandler = new CreateUser(this.client);
  }

  async saveUser(saveUserQuery: SaveUserQueryDto): Promise<void> {
    await this.createUserHandler.execute(saveUserQuery);
  }

} 