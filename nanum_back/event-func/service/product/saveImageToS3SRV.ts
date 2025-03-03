import { Upload } from "@aws-sdk/lib-storage";
import { ProductInformation } from "@interface/product";
import { createS3Client } from "dao/connect/createS3Client";

export const saveImageToS3SRV = async (productInformation: ProductInformation) : Promise<string | null> => {
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
      Bucket: "jang-nanugi-front",
      Key: `productImages/${productInformation.siteName}/${productInformation.productId}.jpg`, // "productImages/cupang/" + productInformation.productId + '.jpg',
      Body: file,
      ContentDisposition: 'inline',
      ContentType: 'image/jpeg',
    },
  });
  // S3 오브젝트 
  console.log("Uploading file to S3...", upload);
  // S3 오브젝트 url을 반환
  try {
    const url = await upload.done()
    console.log("Uploading file to S3...", url);
    if(url.Location !== undefined){
      return `https://gonggong99.store/productImages/${productInformation.siteName}/${productInformation.productId}.jpg`;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
  return null;
}