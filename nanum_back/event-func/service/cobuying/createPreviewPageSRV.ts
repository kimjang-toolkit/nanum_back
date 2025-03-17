import { GongGongS3Client } from "@connect/createS3Client";
import { CoBuyingPost } from "@domain/cobuying";
import { CreatePreviewPageDto } from "@interface/cobuying";


export const createPreviewPageSRV = async (coBuying: CoBuyingPost) => {
  // ✅ 상세 페이지 URL 생성
  const detailPageUrl = `https://${process.env.DOMAIN || "gonggong99.store"}/co-buying/${coBuying.id}?ownerName=${encodeURIComponent(coBuying.ownerName)}`;

  // ✅ 미리보기 페이지 데이터 구성
  const createPreviewPageDto: CreatePreviewPageDto = {
    title: coBuying.productName,
    description: coBuying.memo || "지금 공동구매에 참여하세요!",
    imageUrl: coBuying.imageUrl || "/default-thumbnail.jpg", // 기본 이미지 설정 가능
    detailPageUrl: detailPageUrl,
  };

  // ✅ HTML 템플릿 생성
  const previewPageHTMLContent = `<!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${createPreviewPageDto.title}</title>

      <!-- Open Graph (Facebook, Kakao, LinkedIn 등) -->
      <meta property="og:type" content="website" />
      <meta property="og:title" content="${createPreviewPageDto.title}" />
      <meta property="og:description" content="${createPreviewPageDto.description}" />
      <meta property="og:image" content="${createPreviewPageDto.imageUrl}" />
      <meta property="og:url" content="${createPreviewPageDto.detailPageUrl}" />
      <meta property="og:site_name" content="gonggong99.store" />

      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${createPreviewPageDto.title}" />
      <meta name="twitter:description" content="${createPreviewPageDto.description}" />
      <meta name="twitter:image" content="${createPreviewPageDto.imageUrl}" />
      <meta name="twitter:url" content="${createPreviewPageDto.detailPageUrl}" />
      <meta name="twitter:site" content="@gonggong99" />
      <meta name="twitter:creator" content="@gonggong99" />

      <!-- ✅ 유저가 접속하면 상세 페이지로 리디렉트 (한글 깨짐 방지) -->
      <meta http-equiv="refresh" content="0;URL='${createPreviewPageDto.detailPageUrl}'" />
    </head>
    <body>
      <p>잠시만 기다려 주세요. 공동구매 페이지로 이동 중입니다...</p>
    </body>
    </html>`;

  // ✅ HTML 문자열을 Blob으로 변환 후 File 객체 생성
  const previewPageFile = new File([previewPageHTMLContent], "previewPage.html", { type: "text/html" });


  const path = "/previewPage";
  const key = `${coBuying.id}.html`;


  // ✅ 미리보기 페이지 파일을 S3에 업로드
  const s3Client = new GongGongS3Client();
  const uploadResult = await s3Client.uploadFile(path, key, previewPageFile);

  return uploadResult;
};
