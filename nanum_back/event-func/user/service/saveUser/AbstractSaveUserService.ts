import { UserMaster } from "@domain/user";
import { SaveNewUserQuery, SaveUserResDto } from "@interface/user";
import { IUserRepository } from "@user/outbound/dao/IUserRepository";
import { ISaveUserService } from "@user/service/saveUser/ISaveUserService";
import { hashPassword } from "@user/service/authEncrptorSRV";
import { UserDynamoDBAdapter } from "@user/outbound/dao/UserDynamoDBAdapter";
import { APIERROR } from "@common/responseType";
import { QueryDynamoDBCommandFactory } from "@common/dynamodb";

/**
 * 사용자 저장 서비스 추상 클래스
 * 공통 로직을 구현하고 하위 클래스에서 특정 로직만 구현하도록 함
 */
export abstract class AbstractSaveUserService implements ISaveUserService {
  protected readonly repository: IUserRepository;

  constructor() {
    this.repository = new UserDynamoDBAdapter();
  }

  /**
   * 사용자 저장 메서드
   * 템플릿 메서드 패턴을 사용하여 공통 로직 구현
   */
  async saveUser(query: SaveNewUserQuery): Promise<SaveUserResDto> {
    let encryptPassword: string;
    let userMaster: UserMaster;

    try{
      // 1. 사용자 존재 여부 확인
      await this.checkUserExists(query);
    } catch(error){
      throw new APIERROR(400, (error as Error).message);
    }

    try{
      // 2. 비밀번호 암호화
      encryptPassword = await this.encryptPassword(query.password);
    } catch(error){
      throw new APIERROR(500, (error as Error).message);
    }

    try{
      // 3. UserMaster 객체 생성
      userMaster = await this.createUserMaster(query, encryptPassword);
    } catch(error){
      throw new APIERROR(500, (error as Error).message);
    }

    try{
      await this.repository.saveUser(userMaster);
    } catch(error){
      throw new APIERROR(500, (error as Error).message);
    }

    // 5. 응답 생성
    return this.createResponse(userMaster);
  }

  /**
   * 사용자 존재 여부 확인
   * 하위 클래스에서 구현
   */
  protected async checkUserExists(query: SaveNewUserQuery): Promise<void> {
    
    await this.repository.queryUserExistsById(query.id);
  }

  /**
   * UserMaster 객체 생성
   * 하위 클래스에서 구현
   */
  protected abstract createUserMaster(query: SaveNewUserQuery, encryptPassword: string): Promise<UserMaster>;

  /**
   * 비밀번호 암호화
   * 하위 클래스에서 구현
   */
  protected async encryptPassword(password: string): Promise<string> {
    const encryptPassword = await hashPassword(password);
    return encryptPassword;
  };

  /**
   * 응답 객체 생성
   * 공통 응답 형식
   */
  protected createResponse(userMaster: UserMaster): SaveUserResDto {
    return {
      statusCode: 200,
      id: userMaster.id,
      name: userMaster.name,
      email: userMaster.email ?? "",
    };
  }
} 