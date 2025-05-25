import { SaveUserQueryDto } from "@user/dto/SaveUserQueryDto";

/**
 * Temp 데이터 저장소 인터페이스
 * DB 벤더 독립적인 인터페이스
 * Adapter 패턴을 사용하여 다양한 DB 구현체를 사용할 수 있도록 함. 현재는 DynamoDB 구현체만 있음.
 */
export interface IUserRepository {
  saveUser(saveUserQuery: SaveUserQueryDto): Promise<void>;
} 