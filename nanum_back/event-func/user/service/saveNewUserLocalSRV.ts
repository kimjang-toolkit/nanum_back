// import { hashPassword } from "@auth/service/authEncrptorSRV";
// import { APIERROR } from "@common/responseType";
// import { getFormattedKoreaTime } from "@common/time";
// import { UserMaster } from "@domain/user";
// import { SaveNewUserQuery, SaveUserResDto } from "@interface/user";
// import { queryUserOneByIdDAO } from "@user/dao/queryUserOneDAO";
// import { saveUserMasterDAO } from "@user/dao/saveUserMasterDAO";

// /**
//  * 일반 회원가입 진행, 단순 입력 값 저장 로직타기
//  * 각 값을 저장하는 쿼리 만들기
//  * @param query
//  * @returns 
//  */
// export const saveNewUserLocalSRV = async (query: SaveNewUserQuery): Promise<SaveUserResDto> => {

//   try{
//     await checkUserOneExistDAO(query);
//   } catch(error){
//     throw new APIERROR(400, (error as Error).message);
//   }

//   const encryptPassword = await hashPassword(query.password);
  
//   const userMaster: UserMaster = {
//     id: query.id,
//     name: query.name,
//     email: query.email ?? "",
//     password: encryptPassword,
//     joinedAt: getFormattedKoreaTime(), // 가입일시 (ISO 포맷)
//     socialIds: [], // 등록한 소셜 계정 목록, 직접 회원가입만 했다면 빈 배열
//     coBuyingHistory: [], // 공구글 개설 이력
//     applyHistory: [], // 공구 신청 이력
//     location: query.location? query.location : undefined // 위치 정보 (선택값)
//   };

//   try{
//     // 유저 마스터 정보 저장
//     const result: UserMasterRes = await saveUserMasterDAO(userMaster);
//     console.log("유저 정보 저장 완료", result);
//     return result;
//   }catch(error){
//     // console.error('유저 정보 저장 중 오류 발생:', error);
//     throw new APIERROR(500, '유저 정보 저장 중 오류 발생 '+ (error as Error).message);
//   }
// };

// /**
//  * 유저 마스터 정보 조회 후 이미 존재하는 id라면 오류 발생
//  * 이름이나 id가 일치하는 고객 마스터 정보 조회 후 존재하면 오류 발생
//  * @param id 유저 고유 ID
//  * @param name 유저 이름
//  */
// const checkUserOneExistDAO = async (query: SaveNewUserQuery)=> {
//   // 이미 존재하는 id라면 오류 발생
//   const queryUser: UserMaster | null = await queryUserOneByIdDAO(query.id, query.nickName);
//   if(queryUser){
//     throw new APIERROR(400, '이미 존재하는 아이디 또는 이름이에요. 다른 id나 이름을 사용해주세요.');
//   }

// }