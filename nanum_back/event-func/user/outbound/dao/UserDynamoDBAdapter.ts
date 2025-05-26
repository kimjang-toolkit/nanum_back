import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { IUserRepository } from './IUserRepository';
import { DynamoDBClientFactory } from '@common/dynamodb';
import { CreateUser } from '@user/outbound/dao/command/CreateUser';
import { CheckUserById } from '@user/outbound/dao/command';
import { UserMaster } from '@domain/user';

/**
 * DynamoDB 구현체를 사용하는 CoBuying 데이터 저장소 어댑터
 */
export class UserDynamoDBAdapter implements IUserRepository {
  private readonly client: DynamoDBDocument;
  private readonly createUserHandler: CreateUser;
  private readonly CheckUserByIdHandler: CheckUserById;

  constructor() {
    this.client = DynamoDBClientFactory.getInstance();
    this.createUserHandler = new CreateUser(this.client);
    this.CheckUserByIdHandler = new CheckUserById(this.client);
  }

  async saveUser(userMaster: UserMaster, tableName: string): Promise<void> {
    await this.createUserHandler.execute(userMaster, tableName);
  }

  async queryUserExistsById(id: string, tableName: string): Promise<void> {
    await this.CheckUserByIdHandler.execute(id, tableName);
  }

} 