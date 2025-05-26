import { SaveNewUserQuery, SaveUserResDto } from "@interface/user";

/**
 * 사용자 저장 서비스 인터페이스
 * 일반 회원가입과 소셜 회원가입 등 다양한 회원가입 방식을 추상화
 */
export interface ISaveUserService {
  /**
   * 새로운 사용자를 저장
   * @param query 사용자 저장에 필요한 정보
   * @returns 저장된 사용자 정보
   */
  saveUser(query: SaveNewUserQuery): Promise<SaveUserResDto>;
} 