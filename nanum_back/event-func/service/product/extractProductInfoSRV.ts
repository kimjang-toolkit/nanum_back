import { ExtractedProductInfo, ImageMimeType, ProductExtractDto, ProductExtractReq, ProductThumbnail } from "@interface/product";
import { createGenerativeAIClient } from "@connect/createGenerativeAIClient";
import { TaskRequest, TaskType } from "@interface/generativeAI";
import { GongGongS3Client } from "@connect/createS3Client";
import { APIERROR } from "@common/responseType";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new GongGongS3Client();

export const extractProductInfoSRV = async (productExtactReq: ProductExtractReq) => {

  const taskRequest : TaskRequest = {
    taskType: TaskType.productInfoExtract,
    imageBase64: productExtactReq.imgBase64,
    imageMimeType: productExtactReq.imgType,
  };

  const rawTaskResult = await createGenerativeAIClient(taskRequest);
  const extractedProductInfo = JSON.parse(rawTaskResult) as ExtractedProductInfo;
  console.log("extractedProductInfo: "+extractedProductInfo);

  const productUUID = uuidv4();
  const {originalImageUrl, thumbnailImageUrl} = await saveProductImages(productUUID, productExtactReq, extractedProductInfo);

  const productExtractDto: ProductExtractDto = {
    productName: extractedProductInfo.product_name,
    price: extractedProductInfo.price.amount,
    thumbnailUrl: extractedProductInfo.main_thumbnail.label,
    itemVariants: extractedProductInfo.item_variants,
    originalImageUrl: originalImageUrl,
    thumbnailImageUrl: thumbnailImageUrl,
  };

  return productExtractDto;
};

async function saveProductImages(productUUID: string, productExtactReq: ProductExtractReq, extractedProductInfo: ExtractedProductInfo): Promise<{originalImageUrl: string, thumbnailImageUrl: string}> {
  
  const originalImageFile = new File([productExtactReq.imgBase64], extractedProductInfo.main_thumbnail.label, { type: productExtactReq.imgType});
  const originalImageUrl = await saveProductImage("productImages/generativeAI/original", productUUID+productExtactReq.imgType, originalImageFile);

  const thumbnailFile = await imageCrop(extractedProductInfo.main_thumbnail.label, productExtactReq.imgBase64, productExtactReq.imgType, extractedProductInfo.main_thumbnail);
  const thumbnailImageUrl = await saveProductImage("productImages/generativeAI/thumbnail", productUUID+productExtactReq.imgType, thumbnailFile);

  return {originalImageUrl, thumbnailImageUrl};
}

async function saveProductImage(path: string, productUUID: string, file: File): Promise<string> {

  const productImageUrl = await s3Client.uploadFile(path, productUUID, file);
  if(!productImageUrl){
    throw new APIERROR(500, "이미지 업로드 실패");
  }
  return productImageUrl;
}

async function imageCrop(imageName: string, imageBase64: string, imageType: ImageMimeType, thumbnail: ProductThumbnail): Promise<File> {
  const img = new Image();
  img.src = `data:${imageType};base64,${imageBase64}`;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new APIERROR(500, "Canvas rendering context not available");
    }

    // 이미지 크기 기반으로 실제 픽셀 좌표 변환 (정규화된 좌표 사용)
    const width = img.width;
    const height = img.height;
    const xMin = (thumbnail.box_2d.x_min / 1000) * width;
    const yMin = (thumbnail.box_2d.y_min / 1000) * height;
    const xMax = (thumbnail.box_2d.x_max / 1000) * width;
    const yMax = (thumbnail.box_2d.y_max / 1000) * height;

    const cropWidth = xMax - xMin;
    const cropHeight = yMax - yMin;

    // 캔버스 크기 설정 및 크롭 영역 그리기
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    ctx.drawImage(img, xMin, yMin, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // 캔버스를 Blob으로 변환 후 File 객체 생성
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new APIERROR(500, "Failed to create Blob from canvas");
      }
      const file = new File([blob], imageName, { type: imageType});
      return file;
    }, "image/png");
  };
  throw new APIERROR(500, "Failed to create Blob from canvas");
}