import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";

export const createS3Client = (): S3Client => {
    return new S3Client({
        region: process.env.REGIONNAME
    });
}

