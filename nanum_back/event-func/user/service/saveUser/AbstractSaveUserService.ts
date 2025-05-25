import { UserMaster } from "@domain/user";
import { SaveNewUserQuery, UserMasterRes } from "@interface/user";
import { IUserRepository } from "@user/outbound/dao/IUserRepository";
import { ISaveUserService } from "@user/service/saveUser/ISaveUserService";
import { SaveUserQueryDtoBuilder } from "@user/dto/SaveUserQueryDto";
import { hashPassword } from "@user/service/authEncrptorSRV";
import { UserDynamoDBAdapter } from "@user/outbound/dao/UserDynamoDBAdapter";

/**
 * 사용자 저장 서비스 추상 클래스
 * 공통 로직을 구현하고 하위 클래스에서 특정 로직만 구현하도록 함
 */
export abstract class AbstractSaveUserService implements ISaveUserService {
  protected readonly repository: IUserRepository;
  protected readonly tableName: string;

  constructor() {
    this.repository = new UserDynamoDBAdapter();
    this.tableName = `${process.env.DEPLOYSTAGE}-User`;
  }

  /**
   * 사용자 저장 메서드
   * 템플릿 메서드 패턴을 사용하여 공통 로직 구현
   */
  async saveUser(query: SaveNewUserQuery): Promise<UserMasterRes> {
    // 1. 사용자 존재 여부 확인
    await this.checkUserExists(query);

    // 2. 비밀번호 암호화
    const encryptPassword = await this.encryptPassword(query.password);

    // 2. UserMaster 객체 생성
    const userMaster = await this.createUserMaster(query, encryptPassword);

    // 3. 저장 쿼리 생성
    const saveQuery = new SaveUserQueryDtoBuilder()
      .setTableName(this.tableName)
      .setItem(userMaster)
      .build();

    // 4. 저장 실행
    await this.repository.saveUser(saveQuery);

    // 5. 응답 생성
    return this.createResponse(userMaster);
  }

  /**
   * 사용자 존재 여부 확인
   * 하위 클래스에서 구현
   */
  protected checkUserExists(query: SaveNewUserQuery): Promise<void> {
    throw new Error("Method not implemented.");
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
  protected createResponse(userMaster: UserMaster): UserMasterRes {
    return {
      id: userMaster.id,
      name: userMaster.name,
      email: userMaster.email ?? "",
    };
  }
} 