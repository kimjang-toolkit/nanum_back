import { FacebookOGData } from '@interface/product';
import axios from 'axios';

const FACEBOOK_GRAPH_API_VERSION = 'v22.0';
const ACCESS_TOKEN = 'Facebook_AccessToken'; // 실제 토큰 사용

export const getFacebookOGData = async (targetUrl: string): Promise<FacebookOGData> => {
    try {
        // 🚀 1. Facebook Graph API 호출
        const response = await axios.post(`https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/`, null, {
            params: {
                id: targetUrl,
                scrape: true,
                access_token: ACCESS_TOKEN
            },
        });

        console.log('Facebook OG Data:', response.data);
        // ✅ productId & vendorItemId 추출
        const productInfo = extractProductInfo(response.data.ogUrl);
        console.log('Product Info:', productInfo);
        return {
          ogTitle: response.data.ogTitle,
          ogDescription: response.data.ogDescription,
          ogImage: response.data.ogImage,
          ogUrl: response.data.ogUrl,
          productId: productInfo
        } as FacebookOGData;

    } catch (error: any) {
      console.error('Error fetching Facebook OG data:', error.response?.data || error.message);

      // 🚀 2. 에러 메시지에서 'og:image:url'과 'url' 추출
      const errorMessage = error.response?.data?.error?.error_user_msg || "";
      
      // ① `og:image:url` 값 추출 (ex: '//thumbnail6.coupangcdn.com/...')
      const imageUrlMatch = errorMessage.match(/'\/\/(.*?)'/);
      const fixedImageUrl = imageUrlMatch ? `https://${imageUrlMatch[1]}` : '';

      // ② 요청한 원본 URL 추출 (ex: 'https://www.coupang.com/vp/products/...')
      const urlMatch = errorMessage.match(/'https:\/\/(.*?)'/);
      const extractedUrl = urlMatch ? `https://${urlMatch[1]}` : targetUrl; // 없으면 원본 targetUrl 반환

      console.log('Extracted URL:', extractedUrl);
      console.log('Fixed OG Image URL:', fixedImageUrl);

      // ✅ productId & vendorItemId 추출
      const productInfo = extractProductInfo(extractedUrl);

      return {
          ogTitle: '',
          ogDescription: '',
          productId: productInfo,
          ogImage: fixedImageUrl,
          ogUrl: extractedUrl
      } as FacebookOGData;
    }
};

// 🛠 쿠팡 URL에서 productId와 vendorItemId 추출
const extractProductInfo = (url: string) : string | null => {
  const match = url.match(/products\/(\d+)\?vendorItemId=(\d+)/);
  if (match) {
      return `${match[1]}?vendorItemId=${match[2]}`;
  }
  return null;
};