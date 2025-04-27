import { APIERROR } from "@common/responseType";
import { getFormattedKoreaTime } from "@common/time";
import { UserMaster } from "@domain/user";
import { SaveNewUserQuery, SaveUserRes } from "@interface/user";
import { saveUserMasterDAO } from "@user/dao/saveUserMasterDAO";

/**
 * 일반 회원가입 진행, 단순 입력 값 저장 로직타기
 * 각 값을 저장하는 쿼리 만들기
 * @param query
 * @returns 
 */
export const saveNewUserLocalSRV = async (query: SaveNewUserQuery): Promise<SaveUserRes> => {
  const userMaster: UserMaster = {
    id: query.id,
    name: query.name,
    email: query.email ?? "",
    joinedAt: getFormattedKoreaTime(), // 가입일시 (ISO 포맷)
    socialIds: [], // 등록한 소셜 계정 목록, 직접 회원가입만 했다면 빈 배열
    coBuyingHistory: [], // 공구글 개설 이력
    applyHistory: [], // 공구 신청 이력
    location: query.location? query.location : undefined // 위치 정보 (선택값)
  };
  try{
    // 유저 마스터 정보 저장
    const result: SaveUserRes = await saveUserMasterDAO(userMaster);
    console.log("유저 정보 저장 완료", result);
    return result;
  }catch(error){
    // console.error('유저 정보 저장 중 오류 발생:', error);
    throw new APIERROR(500, '유저 정보 저장 중 오류 발생 '+ (error as Error).message);
  }
};