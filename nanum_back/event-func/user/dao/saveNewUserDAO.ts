import { createDynamoDBDocClient } from "@connect/createDDbDocClient";
import { SaveNewUserQuery } from "@interface/user";


const ddbDocClient = createDynamoDBDocClient();

export const saveNewUserDAO = async (query: SaveNewUserQuery): Promise<SaveUserRes> => {

}