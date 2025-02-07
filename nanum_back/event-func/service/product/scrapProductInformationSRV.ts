import crypto from 'crypto';

import { ProductInformation } from '@interface/product';
export const scrapProductInformationSRV = async (productUrl: string): Promise<ProductInformation>=> {

  const datetime = new Date().toISOString().substr(2,17).replace(/:/gi, '').replace(/-/gi, '') + "Z";
  const method ='GET';
  const path ='/v2/providers/seller_api/apis/api/v1/marketplace/meta/category-related-metas/display-category-codes/77723';
  const query = '';

  const message = datetime + method + path + query;
  const urlpath = path + '?' + query;

  //input your accessKey
  const ACCESS_KEY = '';
  //input your secretKey
  const SECRET_KEY = '';
  const algorithm = 'sha256';
  const signature = crypto.createHmac(algorithm, SECRET_KEY)
                    .update(message)
                    .digest('hex');
  
  const authorization = 'CEA algorithm=HmacSHA256, access-key=' + ACCESS_KEY + ', signed-date=' + datetime + ', signature=' + signature;
  console.log(authorization);                  

  const url = `https://api-gateway.coupang.com${urlpath}`;

  // const response = await fetch(url, {
  //   method: method,
  //   headers: {
  //     'Content-Type': 'application/json;charset=UTF-8',
  //     'Authorization': authorization,
  //     'X-EXTENDED-TIMEOUT': '90000'
  //   }
  // });

  // const data = await response.json();

  return {
    productUrl: productUrl,
    productName: '캐트리스 HD 리퀴드 커버리지 파운데이션 30ml',
    productPrice: '11900',
    productId: '71206262644',
    imageUrl: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/1062734857924374-91c7c85c-98c1-4938-ac2a-9683dc4d8e58.jpg',
    productDescription: '캐트리스 HD 리퀴드 커버리지 파운데이션 30ml',
  } as ProductInformation

}