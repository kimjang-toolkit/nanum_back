import { APIERROR } from "@common/responseType";
import { ImageMimeType, ProductThumbnail } from "@interface/product";

function base64ToBuffer(base64String: string): Buffer {
  // ✅ "data:image/png;base64," 프리픽스 제거
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  
  // ✅ Base64 문자열을 Buffer로 변환
  return Buffer.from(base64Data, "base64");
}

export async function base64ToFile(base64String: string, fileName: string, mimeType: string): Promise<File> {
  // ✅ Base64 Prefix 확인 후 자동 추가 (필요 시)
  if (!base64String.startsWith("data:")) {
    base64String = `data:${mimeType};base64,` + base64String;
  }
  
  // Base64 Prefix 제거 (예: "data:image/png;base64," 제거)
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  
  // Base64를 Buffer로 변환
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Blob 생성 후 File 객체 생성
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}

// /**
//  * 이미지를 크롭하고 File 객체로 반환
//  * 
//  * @param imageName 이미지 이름
//  * @param imageBase64 이미지 Base64
//  * @param imageType 이미지 타입
//  * @param thumbnail 썸네일 정보
//  * @returns 크롭된 이미지 File 객체
//  */

// export async function imageCrop(
//   imageName: string,
//   imageBase64: string,
//   imageType: ImageMimeType,
//   thumbnail: ProductThumbnail
// ): Promise<File> {
//   try {
//     // ✅ Base64 → Buffer 변환
//     const imageBuffer = base64ToBuffer(imageBase64);

//     // ✅ 이미지 메타데이터 가져오기
//     const metadata = await sharp(imageBuffer).metadata();
//     const width = metadata.width || 1000;
//     const height = metadata.height || 1000;

//     // ✅ 정규화된 좌표를 실제 픽셀 값으로 변환
//     const xMin = Math.round((thumbnail.box_2d.x_min / 1000) * width);
//     const yMin = Math.round((thumbnail.box_2d.y_min / 1000) * height);
//     const xMax = Math.round((thumbnail.box_2d.x_max / 1000) * width);
//     const yMax = Math.round((thumbnail.box_2d.y_max / 1000) * height);

//     const cropWidth = xMax - xMin;
//     const cropHeight = yMax - yMin;

//     // ✅ Sharp로 이미지 크롭 및 변환
//     const croppedImageBuffer = await sharp(imageBuffer)
//       .extract({ left: xMin, top: yMin, width: cropWidth, height: cropHeight })
//       .toFormat(imageType.split("/")[1] as keyof FormatEnum) // ✅ 형변환 적용
//       .toBuffer();

//     // ✅ Buffer → File 변환
//     const croppedFile = bufferToFile(croppedImageBuffer, imageName, imageType);
//     return croppedFile;
//   } catch (error) {
//     throw new APIERROR(500, `Image processing failed: ${(error as Error).message}`);
//   }
// }

// function bufferToFile(buffer: Buffer, fileName: string, mimeType: string): File {
//   const blob = new Blob([buffer], { type: mimeType });
//   return new File([blob], fileName, { type: mimeType });
// }