import { DivideType } from "@domain/cobuying";
import { CoBuyingCreateReq } from "@interface/cobuying";
import { ProductInformation } from "@interface/product";
import { saveImageToS3SRV } from "@product/saveImageToS3SRV";
import { scrapCupangSiteSRV } from "@product/scrapCupangSiteSRV";

/**
 * 상품 정보 스크래핑
 * @param input 공구글 생성 입력 데이터
 */
export async function retrieveProductInformation(input: CoBuyingCreateReq<DivideType>): Promise<ProductInformation>{
  try {
      if (input.productLink) {
          const productInformation : ProductInformation = await scrapCupangSiteSRV(input.productLink);
          console.log('productInformation : ', productInformation);
          if(productInformation.productImageUrl && productInformation.productUrl && productInformation.productId){
              input.imageUrl = productInformation.productImageUrl;
              input.productLink = productInformation.productUrl;
              const imageUrl = await saveImageToS3SRV(productInformation);
              if(imageUrl){
                  input.imageUrl = imageUrl;
              }
              return Promise.resolve(productInformation);
          }   
      }
  } catch (error) {
      console.error(error);
  }
  return Promise.resolve({});
}