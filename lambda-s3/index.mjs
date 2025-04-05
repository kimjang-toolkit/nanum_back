/**
 * 특정 S3 버킷에 저장된 이미지를 썸네일 이미지로 변환하는 람다 함수
 *
 * 1. 원본 이미지 저장
 * 2. 원본 이미지에서 상품 정보 추출
 * 3. 썸네일 영역에 따라 이미지 저장
 * 4. 상품 정보 반환
 *
 */

// Dependencies
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import sharp from "sharp";
import util from "util";

// Create S3 client
const s3 = new S3Client({ region: "ap-northeast-2" });

// Define the handler function
export const handler = async (event, context) => {
  console.log(
    "Reading options from event:\n",
    util.inspect(event, { depth: 5 })
  );

  // ✅ 1️⃣ 이벤트에서 원본 이미지 버킷 및 객체 키 가져오기
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  // const dstBucket = srcBucket; // 썸네일 저장할 버킷
  const dstKey = srcKey.replace("original", "thumbnail"); // 썸네일 저장할 키;

  // ✅ 2️⃣ 이미지 타입 확인
  const typeMatch = srcKey.match(/\.([^.]*)$/);

  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }
  const imageType = typeMatch[1].toLowerCase();
  console.log("이미지 타입: " + imageType);
  if (
    imageType !== "jpg" &&
    imageType !== "png" &&
    imageType !== "jpeg" &&
    imageType !== "webp" &&
    imageType !== "heic" &&
    imageType !== "heif"
  ) {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  // ✅ 원본 이미지 가져오기 (메타데이터 포함)
  let originalFileResponse;
  try {
    console.log("Bucket: " + srcBucket + " Key: " + srcKey);
    originalFileResponse = await s3.send(
      new GetObjectCommand({ Bucket: srcBucket, Key: srcKey })
    );
  } catch {
    console.log("Error image GetObject :", error);
    return;
  }
  console.log("저장 목표 위치: " + dstKey);
  // console.log("originalFileResponse: " + JSON.stringify(originalFileResponse));
  // ✅ 이미지 데이터 읽기
  const { Body, ...rest } = originalFileResponse;
  console.log("originalFileResponse metadata:", rest);
  const stream = Body;
  if (!(stream instanceof Readable)) {
    console.log("Invalid image stream.");
    return;
  }

  let outputBuffer;
  try {
    const contentBuffer = Buffer.concat(await stream.toArray());
    console.log("valid image download, start to resize");
    outputBuffer = await resizeImageToThumbnail(
      contentBuffer,
      320,
      320,
      "jpeg"
    );
    console.log("이미지 썸네일 생성 완료");
  } catch (error) {
    console.log("썸네일 생성 실패:", error);
    return;
  }

  // ✅ 6️⃣ 변환된 이미지 S3에 업로드
  console.log("목표 버킷: " + srcBucket);
  const s3Client = new S3Client({
    region: process.env.REGIONNAME,
  });
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: srcBucket,
        Key: dstKey,
        Body: outputBuffer,
        ContentDisposition: "inline",
        ContentType: "image/png",
      },
    });
    // await s3.send(
    //   new PutObjectCommand({
    //     Bucket: srcBucket,
    //     Key: dstKey,
    //     Body: outputBuffer,
    //     ContentType: "image/png",
    //   })
    // );
    try {
      const url = await upload.done();
      console.log("Uploading file to S3...", url);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("이미지 업로드 실패");
    }
  } catch (error) {
    console.log("Error uploading image:", error);
    return;
  }

  console.log(
    `Successfully cropped & resized ${srcBucket}/${srcKey} → ${srcBucket}/${dstKey}`
  );
};

// utils/sharpUtils.ts 또는 상단에 따로 함수로 분리
const resizeImageToThumbnail = async (
  inputBuffer,
  width = 320,
  height = 320,
  format = "jpeg"
) => {
  try {
    console.log("inputBuffer로 이미지 변환 시작");
    const transformer = sharp(inputBuffer).resize(width, height, {
      fit: "inside", // 비율 유지하면서 최대한 맞추기
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // 여백 배경색 (white)
    });
    console.log("inputBuffer로 이미지 변환 완료");
    if (format === "jpeg") {
      transformer.jpeg({ quality: 80 });
    } else if (format === "png") {
      transformer.png();
    } else if (format === "webp") {
      transformer.webp({ quality: 80 });
    }
    console.log("sharp 변환 완료");
    const outputBuffer = await transformer.toBuffer();
    if (!outputBuffer || outputBuffer.length === 0) {
      console.log("⚠️ outputBuffer가 비어있습니다.");
      return;
    }
    console.log("✅ outputBuffer 크기:", outputBuffer.length, "bytes");
    return outputBuffer;
  } catch (error) {
    console.log("sharp 변환 에러:", error);
    throw new Error("이미지 변환 실패");
  }
};
