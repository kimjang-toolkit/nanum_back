import { getFormattedKoreaTime } from "@common/time";
import { UserMaster } from "@domain/user";
import { SaveNewUserQuery } from "@interface/user";
import { AbstractSaveUserService } from "@user/service/saveUser/AbstractSaveUserService";

/**
 * '일반 회원가입' 서비스
 */
// export class SaveKakaoUserService extends AbstractSaveUserService {

//   protected createUserMaster(query: SaveNewUserQuery, encryptPassword: string): Promise<UserMaster> {
    
//     // const userMaster: UserMaster = {};

//     // return Promise.resolve(userMaster);
//   }

// }