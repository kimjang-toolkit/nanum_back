import { SaveNewUserQuery, SaveUserRes } from "@interface/user";
import { saveNewUserDAO } from "@user/dao/saveNewUserDAO";

/**
 * 일반 회원가입 진행, 단순 입력 값 저장 로직타기
 * 각 값을 저장하는 쿼리 만들기
 * @param query
 * @returns 
 */
export const saveNewUserLocalSRV = async (query: SaveNewUserQuery): Promise<SaveUserRes> => {
  return saveNewUserDAO(query);
};