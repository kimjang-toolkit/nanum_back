import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIERROR } from "@common/responseType";
import { createDynamoDBDocClient } from "@connect/createDDbDocClient";
import { UserMaster } from "@domain/user";
import { SaveNewUserQuery, SaveUserRes } from "@interface/user";


const ddbDocClient = createDynamoDBDocClient();

export const saveUserMasterDAO = async (userMaster: UserMaster): Promise<SaveUserRes> => {

  const deployEnv = process.env.DEPLOY_ENV === 'Prod' ? process.env.DEPLOY_ENV : 'Dev'

  const params = {
    TableName:  deployEnv + "-UserTable",
    Item: userMaster
  }
  let result;
  try{
    const command = new PutCommand(params);
    result = await ddbDocClient.send(command);
    if (result.$metadata.httpStatusCode == 200){
      return {
        message: '유저 정보 저장 완료',
        id: userMaster.id,
        name: userMaster.name,
        email: userMaster.email,
      }
    }
  }catch(error){
    console.error('DynamoDB 삽입 중 오류 발생:', error);
    throw new APIERROR(500, '유저 정보 저장 중 오류 발생');
  }
  
  const errorMessage = `DynamoDB 삽입 오류: 상태 코드 ${result.$metadata.httpStatusCode}, 요청 결과: ${JSON.stringify(result)}`;
  throw new APIERROR(500,errorMessage);
}