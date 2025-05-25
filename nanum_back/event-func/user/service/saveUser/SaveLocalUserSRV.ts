import { getFormattedKoreaTime } from "@common/time";
import { UserMaster } from "@domain/user";
import { SaveNewUserQuery } from "@interface/user";
import { AbstractSaveUserService } from "@user/service/saveUser/AbstractSaveUserService";

/**
 * '일반 회원가입' 서비스
 */
export class SaveLocalUserService extends AbstractSaveUserService {

  protected createUserMaster(query: SaveNewUserQuery, encryptPassword: string): Promise<UserMaster> {
    
    const userMaster: UserMaster = {
      id: query.id,
      name: query.name,
      email: query.email ?? "",
      password: encryptPassword,
      joinedAt: getFormattedKoreaTime(), // 가입일시 (ISO 포맷)
      socialIds: [], // 등록한 소셜 계정 목록, 직접 회원가입만 했다면 빈 배열
      coBuyingHistory: [], // 공구글 개설 이력
      applyHistory: [], // 공구 신청 이력
      location: query.location? query.location : undefined // 위치 정보 (선택값)
    };

    return Promise.resolve(userMaster);
  }

}