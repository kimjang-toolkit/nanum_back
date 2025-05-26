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
  private readonly tableName: string;

  constructor() {
    this.client = DynamoDBClientFactory.getInstance();
    this.createUserHandler = new CreateUser(this.client);
    this.CheckUserByIdHandler = new CheckUserById(this.client);
    this.tableName = `${process.env.DEPLOYSTAGE}-UserTable`;
  }

  async saveUser(userMaster: UserMaster): Promise<void> {
    await this.createUserHandler.execute(userMaster, this.tableName);
  }

  async queryUserExistsById(id: string): Promise<void> {
    await this.CheckUserByIdHandler.execute(id, this.tableName);
  }

} 