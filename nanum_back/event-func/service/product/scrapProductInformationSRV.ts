import { FacebookOGData, ProductInformation } from '@interface/product';
import { getFacebookOGData } from '@connect/createFacebookClient';

export const scrapProductInformationSRV = async (productUrl: string): Promise<ProductInformation> => {
    

    try {
        const facebookOGData : FacebookOGData = await getFacebookOGData(productUrl);
        console.log('Facebook OG Data:', facebookOGData);
        return {
            siteName: '쿠팡',
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