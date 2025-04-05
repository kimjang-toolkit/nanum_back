import { APIERROR } from "@common/responseType";
import { ImageMimeType, ProductExtractDto, ProductExtractReq } from "@interface/product";
import { extractProductInfoSRV } from "@product/extractProductInfoSRV";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { LambdaReturnDto } from "dto/LambdaReturnDto";

export const extractProductInfoCTL = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  let productExtractReq: ProductExtractReq;
  
  try{
    productExtractReq = validateProductExtractReq(event);
  } catch (error) {
    if (error instanceof APIERROR) {
      return new LambdaReturnDto(error.statusCode, { message: error.message }, event).getLambdaReturnDto();
    }
    return new LambdaReturnDto(500, { message: (error as Error).message }, event).getLambdaReturnDto();
  }

  const extractedProductInfo:ProductExtractDto = await extractProductInfoSRV(productExtractReq);
  return new LambdaReturnDto(200, extractedProductInfo, event).getLambdaReturnDto();
};


function validateProductExtractReq(event: APIGatewayProxyEventV2): ProductExtractReq {
  const productExtractReq: ProductExtractReq = JSON.parse(event.body ?? '{}');

  if (!productExtractReq.imgBase64 || productExtractReq.imgBase64.length === 0) {
    throw new APIERROR(400, '캡처 사진을 꼭 입력해주세요!');
  }
  if(!productExtractReq.imgType) {
    throw new APIERROR(400, '캡처 사진의 타입을 꼭 입력해주세요!');
  }
  if(!Object.values(ImageMimeType).includes(productExtractReq.imgType)) {
    throw new APIERROR(400, '캡처 사진의 타입이 올바르지 않습니다!');
  }
  
  return productExtractReq;
}