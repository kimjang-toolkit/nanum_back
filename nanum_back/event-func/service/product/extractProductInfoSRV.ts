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
export const extractProductInfoSRV = async (productExtactReq: ProductExtractReq) => {


  const productUUID = uuidv4(); 
  const originalImageUrl = await saveOriginalImage(productUUID, productExtactReq);
  console.log("originalImageUrl: "+originalImageUrl);

  const taskRequest : TaskRequest = {
    taskType: TaskType.productInfoExtract,
    imageBase64: productExtactReq.imgBase64,
    imageMimeType: productExtactReq.imgType,
    imageUrl: originalImageUrl,
  };

  console.log("taskRequest: "+JSON.stringify({imageUrl: taskRequest.imageUrl, taskType: taskRequest.taskType, imageMimeType: taskRequest.imageMimeType}));
  const rawTaskResult = await createGenerativeAIClient(taskRequest);
  console.log("rawTaskResult: "+rawTaskResult);
  const extractedProductInfo = JSON.parse(rawTaskResult) as ExtractedProductInfo;
  console.log("extractedProductInfo: "+extractedProductInfo);

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

  return {};
};

async function saveOriginalImage(productUUID: string, productExtactReq: ProductExtractReq): Promise<string> {
  const originalImageFile = await base64ToFile(productExtactReq.imgBase64
                                              , productUUID+productExtactReq.imgType
                                              , productExtactReq.imgType);
  const imageType = "."+productExtactReq.imgType.split("/")[1];
  const originalImageUrl = await s3Client.uploadFile("productImages/generativeAI/original"
                                                  , productUUID+imageType
                                                  , originalImageFile);
  if(!originalImageUrl){
    throw new APIERROR(500, "이미지 업로드 실패");
  }
  return originalImageUrl;
}

// async function saveThumbnailImage(productUUID: string, productExtactReq: ProductExtractReq, extractedProductInfo: ExtractedProductInfo): Promise<string> {
//   const thumbnailFile = await imageCrop(productUUID+productExtactReq.imgType
//                                         , productExtactReq.imgBase64, productExtactReq.imgType
//                                         , extractedProductInfo.main_thumbnail);
//   const imageType = "."+productExtactReq.imgType.split("/")[1];
//   const thumbnailImageUrl = await saveProductImage("productImages/generativeAI/thumbnail"
//                                                   , productUUID+imageType
//                                                   , thumbnailFile);
//   return thumbnailImageUrl;
// }

