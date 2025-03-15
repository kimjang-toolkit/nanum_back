import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { APIERROR } from "@common/responseType";
import { getTodayDate } from "@common/time";

export const createS3Client = (): S3Client => {
    return new S3Client({
        region: process.env.REGIONNAME
    });
}

export class GongGongS3Client{
  private s3Client: S3Client;

  constructor(){
    this.s3Client = createS3Client();
  }

  /**
   * 
   * @param imageUUID 
   * @param file 
   * @returns 
   */
  public async uploadFile(path: string, key: string, file: File): Promise<string|null> {
    if(file.size === 0){
      throw new APIERROR(400, "이미지 파일이 비어있습니다.");
    }
    // 오늘 날짜를 yyyyMMdd 형식으로 가져옴
    const todayDate = getTodayDate();
    
    // ✅ Base64에서 변환한 `File`을 `Blob`으로 변경
    const blob = new Blob([file], { type: file.type });


    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: "jang-nanugi-front",
        Key: `${path}/${todayDate}/${key}`,
        Body: blob,
        ContentDisposition: 'inline',
        ContentType: file.type,
      },
    });

    // S3 오브젝트 url을 반환
    try {
      const url = await upload.done()
      console.log("Uploading file to S3...", url);
      if(url.Location !== undefined){
        return `https://gonggong99.store/${path}/${todayDate}/${key}`;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new APIERROR(500, "이미지 업로드 실패"+(error as Error).message);
    }
    return null;
  }

  public async uploadImgUrl(path: string, key: string, imgUrl: string): Promise<string|null> {
    const rowImageFile = await fetch(imgUrl);
    const blob = await rowImageFile.blob();
    const file = new File([blob], key, { type: 'image/jpeg' });
    return this.uploadFile(path, key, file);
  }

  public async uploadBase64Img(path: string, key: string, base64Img: string): Promise<string|null> {
    const file = new File([base64Img], key, { type: 'image/jpeg' });
    return this.uploadFile(path, key, file);
  }
  
}