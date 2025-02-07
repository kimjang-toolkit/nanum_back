import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { ProductInformation } from "@interface/product";
import { createS3Client } from "dao/connect/createS3Client";

export const saveProductInformationSRV = async (productInformation: ProductInformation) => {
  let file;
  if(productInformation.imageUrl !== undefined && productInformation.productId !== undefined){
    const response = await fetch(productInformation.imageUrl);
    const blob = await response.blob();
    file = new File([blob], productInformation.productId + '.jpg', { type: 'image/jpeg' });
    console.log("File created successfully.");
  }

  const s3Client = createS3Client();
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: "gonggong99-back-sam",
      Key: "productImages/cupang/" + productInformation.productId + '.jpg',
      Body: file,
    },
  });

  console.log("Uploading file to S3...");
  try {
    await upload.done();
    console.log("File uploaded successfully.");
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}