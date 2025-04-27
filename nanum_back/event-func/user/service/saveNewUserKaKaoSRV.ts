import { APIERROR } from "@common/responseType";
import { getFormattedKoreaTime } from "@common/time";
import { SocialType, UserMaster } from "@domain/user";
import { SaveNewUserQuery, SaveUserRes } from "@interface/user";
import { saveUserMasterDAO } from "@user/dao/saveUserMasterDAO";

export const saveNewUserKaKaoSRV = async (query: SaveNewUserQuery): Promise<SaveUserRes> => {
  let result: SaveUserRes;
  let userMaster: UserMaster;
  
  try{
    userMaster = {
      id: query.id,
      name: query.name,
      email: query.email,
      joinedAt: getFormattedKoreaTime(),
      socialIds: [{
        type: SocialType.KAKAO,
        account: query.email ?? "",
        socialUserId: "",
      }],
      coBuyingHistory: [],
      applyHistory: [],
      location: query.location,
    };
    result = await saveUserMasterDAO(userMaster);
  } catch (error) {
    throw new APIERROR(500, '유저 정보 저장 중 오류 발생 '+ (error as Error).message);
  }
  return result;
}