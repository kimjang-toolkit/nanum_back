import { FacebookOGData, ProductInformation } from '@interface/product';
import { getFacebookOGData } from '@connect/createFacebookClient';

export const scrapCupangSiteSRV = async (productUrl: string): Promise<ProductInformation> => {
    
    const siteName = getSiteName(productUrl);

    try {
        const facebookOGData : FacebookOGData = await getFacebookOGData(productUrl);
        console.log('Facebook OG Data:', facebookOGData);
        return {
            siteName: siteName,
            title: '쿠팡 상품 검색',
            productId: facebookOGData.productId,
            description: '쿠팡 상품 검색',
            imageUrl: facebookOGData.ogImage,
            url: facebookOGData.ogUrl,
        } as ProductInformation;

    } catch (err) {
        console.error('Fetch Error:', err);
        throw err;
    }
};

function getSiteName(productUrl: string): string {
    const url = new URL(productUrl);
    const hostnameParts = url.hostname.split('.');

    if (hostnameParts.length >= 2) {
        return hostnameParts[hostnameParts.length - 2]; // "coupang"
    }
    return url.hostname; // 도메인 구조가 이상할 경우 원본 반환
}