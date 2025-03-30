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
  const dstBucket = srcBucket; // 썸네일 저장할 버킷
  const dstKey = srcKey.replace("original", "thumbnail"); // 썸네일 저장할 키;

  // ✅ 2️⃣ 이미지 타입 확인
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }
  const imageType = typeMatch[1].toLowerCase();
  if (imageType !== "jpg" && imageType !== "png") {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  // ✅ 원본 이미지 가져오기 (메타데이터 포함)
  const response = await s3.send(
    new GetObjectCommand({ Bucket: srcBucket, Key: srcKey })
  );

  // ✅ 이미지 데이터 읽기
  const stream = response.Body;
  if (!(stream instanceof Readable)) throw new Error("Invalid image stream.");
  const contentBuffer = Buffer.concat(await stream.toArray());

  // ✅ 메타데이터 추출
  const s3Metadata = response.Metadata;
  if (!s3Metadata) throw new Error("No metadata found in the source image.");

  // ✅ Sharp 라이브러리를 사용하여 이미지의 width, height 가져오기
  const metadata = await sharp(contentBuffer).metadata();
  const width = metadata.width;
  const height = metadata.height;

  // ✅ 메타데이터 확인
  console.log(`Image dimensions - Width: ${width}, Height: ${height}`);

  // ✅ 좌표 정규화 (0~1000 → 실제 픽셀 값)
  let xMin = Math.round((parseInt(s3Metadata["x_min"], 10) / 1000) * width);
  let yMin = Math.round((parseInt(s3Metadata["y_min"], 10) / 1000) * height);
  let xMax = Math.round((parseInt(s3Metadata["x_max"], 10) / 1000) * width);
  let yMax = Math.round((parseInt(s3Metadata["y_max"], 10) / 1000) * height);

  console.log("xMin: ", xMin, "yMin: ", yMin, "xMax: ", xMax, "yMax: ", yMax);

  if (isNaN(xMin) || isNaN(yMin) || isNaN(xMax) || isNaN(yMax)) {
    console.error(
      "Invalid crop metadata. xMin: ",
      xMin,
      "yMin: ",
      yMin,
      "xMax: ",
      xMax,
      "yMax: ",
      yMax
    );
    xMin = 0;
    yMin = 0;
    xMax = width;
    yMax = height;
  }

  // ✅ 5️⃣ 이미지 크롭 및 320x320 리사이징 (비율 유지)
  let outputBuffer;
  try {
    outputBuffer = await sharp(contentBuffer)
      .extract({
        // 메타데이터 기반 크롭
        left: xMin,
        top: yMin,
        width: xMax - xMin,
        height: yMax - yMin,
      })
      .resize(320, 320, {
        // 비율 유지하며 320x320 크기로 조정
        fit: "inside",
      })
      .jpeg({ quality: 60 }) // JPEG 품질을 60으로 설정
      .toBuffer();
  } catch (error) {
    console.log("Error processing image:", error);
    return;
  }

  // ✅ 6️⃣ 변환된 이미지 S3에 업로드
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: dstBucket,
        Key: dstKey,
        Body: outputBuffer,
        ContentType: "image/png",
      })
    );
  } catch (error) {
    console.log("Error uploading image:", error);
    return;
  }

  console.log(
    `Successfully cropped & resized ${srcBucket}/${srcKey} → ${dstBucket}/${dstKey}`
  );
};
