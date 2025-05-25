import { SaveNewUserQuery, UserMasterRes } from "@interface/user";

export interface ISaveUserService {
  saveUser(query: SaveNewUserQuery) : Promise<UserMasterRes>;
}