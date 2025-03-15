import { APIERROR } from "@common/responseType";
import { ImageMimeType, ProductThumbnail } from "@interface/product";

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

/**
 * 이미지를 크롭하고 File 객체로 반환
 * 
 * @param imageName 이미지 이름
 * @param imageBase64 이미지 Base64
 * @param imageType 이미지 타입
 * @param thumbnail 썸네일 정보
 * @returns 크롭된 이미지 File 객체
 */
export async function imageCrop(
  imageName: string,
  imageFile: File,
  imageType: ImageMimeType,
  thumbnail: ProductThumbnail
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new APIERROR(500, "Canvas rendering context not available"));
        return;
      }

      // 원본 이미지 크기 가져오기
      const width = img.width;
      const height = img.height;

      // 정규화된 box_2d 좌표를 실제 픽셀 좌표로 변환
      const xMin = Math.round((thumbnail.box_2d.x_min / 1000) * width);
      const yMin = Math.round((thumbnail.box_2d.y_min / 1000) * height);
      const xMax = Math.round((thumbnail.box_2d.x_max / 1000) * width);
      const yMax = Math.round((thumbnail.box_2d.y_max / 1000) * height);

      const cropWidth = xMax - xMin;
      const cropHeight = yMax - yMin;

      // 캔버스 크기 설정
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // 원본 이미지에서 크롭된 부분을 캔버스에 그림
      ctx.drawImage(img, xMin, yMin, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // 캔버스를 Blob으로 변환 후 File 객체 생성
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new APIERROR(500, "Failed to create Blob from canvas"));
          return;
        }
        const file = new File([blob], imageName, { type: imageType });
        resolve(file);
      }, imageType);
    };

    img.onerror = () => {
      reject(new APIERROR(500, "Failed to load the image."));
    };
  });
}