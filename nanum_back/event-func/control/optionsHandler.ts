import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { LambdaReturnDto } from "dto/LambdaReturnDto";

export const optionsHandler = async (event:APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  // return {
  //   statusCode: 200,
  //   headers: {
  //     'Access-Control-Allow-Headers':
  //         'Content-Type, Set-Cookie, x-amzn-Remapped-Authorization, Authorization, X-Forwarded-For, X-Api-Key, X-Amz-Security-Token, GongGong99-AccessToken, GongGong99-RefreshToken',
  //       'Access-Control-Allow-Origin': event.headers.origin||'https://gonggong99.store' , // Allow from anywhere
  //       'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS', // Allow only GET request
  //       'Access-Control-Allow-Credentials': 'true',
  //       'Access-Control-Expose-Headers':
  //         'Content-Type, x-amzn-Remapped-Authorization, Authorization, X-Forwarded-For, X-Api-Key, X-Amz-Security-Token, GongGong99-AccessToken, GongGong99-RefreshToken, Set-Cookie',
  //   },
  //   body: ""
  // };

    return new LambdaReturnDto(200, {}, event).getLambdaReturnDto();
};