import { load } from 'cheerio';
import { ProductInformation } from '@interface/product';
import { writeFileSync } from 'fs';

export const scrapProductInformation = async (productUrl: string): Promise<ProductInformation> => {
    // const product = await getProduct(productId);
    // const productInformation = await scrapProductInformation(product);
    // return productInformation;

    const productLink =
        'https://www.coupang.com/vp/products/8449280153?itemId=24443734907&vendorItemId=91457687104&q=%EB%AA%A8%EB%8B%88%ED%84%B0&itemsCount=36&searchId=33f9873b3176239&rank=1&searchRank=1&isAddedCart=';
    console.log(productLink);
    console.log('요청 시작!');
    // const response = await fetch(productLink, {
    //     method: 'GET',
    //     headers: header,
    // });

    console.log('요청 완료!');
    const ogTags = await extractOpenGraphTags(htmlData);
    console.log('태그 추출 완료!', ogTags);
    // htmlData를 txt파일로 저장
    writeFileSync('htmlData.txt', htmlData);

    return {
        site_name: ogTags['og:site_name'],
        title: ogTags['og:title'],
        description: ogTags['og:description'],
        image: ogTags['og:image'],
        url: ogTags['og:url'],
    } as ProductInformation;
};

export const extractOpenGraphTags = async (htmlData: string): Promise<Record<string, string>> => {
    // Cheerio를 사용하여 HTML을 파싱합니다.
    const $ = load(htmlData);

    // Open Graph 메타 태그를 추출합니다.
    const ogTags: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, element) => {
        const property = $(element).attr('property');
        const content = $(element).attr('content');
        if (property && content) {
            ogTags[property] = content;
        }
    });
    return ogTags;
};
