import { ProductInformation } from "@interface/product";

/**
 * ProductInformation 정보를 ProductLedger 테이블에 저장
 * lambda는 다 동기기 때문에 유효성 검사하고 보낸 다음, 비동기로 처리..
 * 저장되지 않더라도 시간 아끼자.
 * @param input 상품 정보
 */
export const saveProductLedger = async (input: ProductInformation) => {

  // lambda로 보내서 저장
  


  // 상품원장에 저장
  const productLedger = {
    productId: input.productId,
    productName: input.productName,
    productDescription: input.productDescription,
    productPrice: input.productPrice,
  };
};