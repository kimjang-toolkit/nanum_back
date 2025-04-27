import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { createDynamoDBDocClient } from "@connect/createDDbDocClient";
import { mapUserMasterOne } from "@user/mapper/mapUserMasterOne";
import { UserMaster } from "@domain/user";
import { APIERROR } from "@common/responseType";

const ddbDocClient = createDynamoDBDocClient();

/**
 * 고객 마스터 정보 조회
 * @param id 고객 고유 ID
 * @returns 고객 마스터 정보
 */
export const queryUserOneByIdDAO = async (id: string): Promise<UserMaster | null> => {
  let result: UserMaster | null = null;
  const deployEnv = process.env.DEPLOY_ENV === 'Prod' ? process.env.DEPLOY_ENV : 'Dev'
  const tableName = `${deployEnv}-UserTable`

  const params = {
    TableName: tableName,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
        ':id': { S: id }
    }
  };
  const command = new QueryCommand(params);
  const queryResult = await ddbDocClient.send(command);

  if(queryResult.Items && queryResult.Items.length > 0){
    result = mapUserMasterOne(queryResult.Items[0]);
  }
  return result;
}