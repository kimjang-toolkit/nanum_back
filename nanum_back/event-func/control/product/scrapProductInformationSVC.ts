export const scrapProductInformation = async (productUrl: string) => {
    // const product = await getProduct(productId);
    // const productInformation = await scrapProductInformation(product);
    // return productInformation;
    const productLink =
        'https://www.coupang.com/vp/products/8449280153?itemId=24443734907&vendorItemId=91457687104&q=%EB%AA%A8%EB%8B%88%ED%84%B0&itemsCount=36&searchId=33f9873b3176239&rank=1&searchRank=1&isAddedCart=';
    console.log(productLink);
    const response = await fetch(productLink);
    const html = await response.text();
    console.log(html);
};
