import { ExtractedProductInfo, ImageMimeType, ProductExtractDto, ProductExtractReq, ProductThumbnail } from "@interface/product";
import { createGenerativeAIClient } from "@connect/createGenerativeAIClient";
import { TaskRequest, TaskType } from "@interface/generativeAI";
import { GongGongS3Client } from "@connect/createS3Client";
import { APIERROR } from "@common/responseType";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { base64ToFile, imageCrop } from "@common/image";
const s3Client = new GongGongS3Client();

/**
 * 
 * 1. 원본 이미지 저장
 * 2. 원본 이미지에서 상품 정보 추출
 * 3. 썸네일 영역에 따라 이미지 저장
 * 4. 상품 정보 반환  
 * 
 * @param productExtactReq
 * @returns 
 */
export const extractProductInfoSRV = async (productExtactReq: ProductExtractReq) : Promise<ProductExtractDto> => {

  const taskRequest : TaskRequest = {
    taskType: TaskType.productInfoExtract,
    imageBase64: productExtactReq.imgBase64,
    imageMimeType: productExtactReq.imgType,
    // imageUrl: originalImageUrl,
  };

  console.log("taskRequest: "+JSON.stringify(taskRequest));
  const rawTaskResult = await createGenerativeAIClient(taskRequest);
  console.log("rawTaskResult: "+rawTaskResult);
  const extractedProductInfo = JSON.parse(rawTaskResult) as ExtractedProductInfo;
  console.log("extractedProductInfo: "+extractedProductInfo);

  const productUUID = uuidv4(); 
  const originalImageUrl = await saveOriginalImage(productUUID, productExtactReq, extractedProductInfo.main_thumbnail.box_2d);
  const thumbnailImageUrl = getThumbnailImageUrl(originalImageUrl);
  console.log("originalImageUrl: "+originalImageUrl);
  console.log("thumbnailImageUrl: "+thumbnailImageUrl);
  // const thumbnailImageUrl = await saveThumbnailImage(productUUID, productExtactReq, extractedProductInfo);
  // console.log("thumbnailImageUrl: "+thumbnailImageUrl);

  // const productExtractDto: ProductExtractDto = {
  //   productName: extractedProductInfo.product_name,
  //   price: extractedProductInfo.price.amount,
  //   thumbnailUrl: extractedProductInfo.main_thumbnail.label,
  //   itemVariants: extractedProductInfo.item_variants,
  //   originalImageUrl: originalImageUrl,
  //   thumbnailImageUrl: thumbnailImageUrl,
  // };

  return {
    productName: extractedProductInfo.product_name,
    price: extractedProductInfo.price.amount,
    itemVariants: extractedProductInfo.item_variants,
    originalImageUrl: originalImageUrl,
    thumbnailImageUrl: thumbnailImageUrl,
  } as ProductExtractDto;
};

async function saveOriginalImage(productUUID: string, productExtactReq: ProductExtractReq, metadata: Record<string, string|number>): Promise<string> {
  const originalImageFile = await base64ToFile(productExtactReq.imgBase64
                                              , productUUID+productExtactReq.imgType
                                              , productExtactReq.imgType);
  const imageType = "."+productExtactReq.imgType.split("/")[1];
  const originalImageUrl = await s3Client.uploadFile("productImages/generativeAI/original"
                                                  , productUUID+imageType
                                                  , originalImageFile, metadata);
  if(!originalImageUrl){
    throw new APIERROR(500, "이미지 업로드 실패");
  }
  return originalImageUrl;
}

function getThumbnailImageUrl(originalImageUrl: string): string {
  const thumbnailImageUrl = originalImageUrl.replace("original", "thumbnail");
  return thumbnailImageUrl;
}

// async function saveThumbnailImage(productUUID: string, productExtactReq: ProductExtractReq, extractedProductInfo: ExtractedProductInfo): Promise<string> {

//   const thumbnailFile = await imageCrop(productUUID+productExtactReq.imgType
//                                         , productExtactReq.imgBase64
//                                         , productExtactReq.imgType
//                                         , extractedProductInfo.main_thumbnail);
//   const imageType = "."+productExtactReq.imgType.split("/")[1];
//   const thumbnailImageUrl = await s3Client.uploadFile("productImages/generativeAI/thumbnail"
//                                                   , productUUID+imageType
//                                                   , thumbnailFile);
//   if(!thumbnailImageUrl){
//     throw new APIERROR(500, "이미지 업로드 실패");
//   }
//   return thumbnailImageUrl;
// }

