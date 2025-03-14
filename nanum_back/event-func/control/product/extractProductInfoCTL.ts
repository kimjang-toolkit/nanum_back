import { APIERROR } from "@common/responseType";
import { ProductExtractReq } from "@interface/product";
import { extractProductInfoSRV } from "@product/extractProductInfoSRV";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { LambdaReturnDto } from "dto/LambdaReturnDto";

export const extractProductInfoCTLasync = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  let productExtractReq: ProductExtractReq;

  try{
    productExtractReq = validateProductExtractReq(event);
  } catch (error) {
    return new LambdaReturnDto(400, { message: 'Invalid request body' }, event).getLambdaReturnDto();
  }

  const extractedProductInfo = await extractProductInfoSRV(productExtractReq);
  return new LambdaReturnDto(200, extractedProductInfo, event).getLambdaReturnDto();
};


function validateProductExtractReq(event: APIGatewayProxyEventV2): ProductExtractReq {
  const productExtractReq: ProductExtractReq = JSON.parse(event.body ?? '{}');
  if (!productExtractReq.imgBase64) {
    throw new APIERROR(400, '캡처 사진을 꼭 입력해주세요!');
  }
  
  return productExtractReq;
}