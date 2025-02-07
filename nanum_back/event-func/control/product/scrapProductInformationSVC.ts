import { load } from 'cheerio';
import { ProductInformation } from '@interface/product';
import { writeFileSync } from 'fs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
/**
 * 
 * @param productUrl module.exports.handler = async (event, context) => {

  const browser = await puppeteer.launch({
    executablePath: await puppeteer.executablePath,
    args: puppeteer.args,
    defaultViewport: puppeteer.defaultViewport,
    headless: puppeteer.headless,
  });

  const page = await browser.newPage();

  await browser.close();
  //// setTimeout(() => chrome.instance.kill(), 0);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello World!"
    })
  }

}
 * @returns 
 */

export const scrapProductInformation = async (productUrl: string): Promise<ProductInformation> => {
    // const product = await getProduct(productId);
    // const productInformation = await scrapProductInformation(product);
    // return productInformation;
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    const page = await browser.newPage();
    const productLink =
        'https://www.coupang.com/vp/products/8449280153?itemId=24443734907&vendorItemId=91457687104&q=%EB%AA%A8%EB%8B%88%ED%84%B0&itemsCount=36&searchId=33f9873b3176239&rank=1&searchRank=1&isAddedCart=';
    console.log(productLink);
    console.log('요청 시작!');
    await page.goto(productUrl);
    await browser.close();
    const htmlData = await page.content();
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
