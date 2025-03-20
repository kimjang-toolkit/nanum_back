import { createCoBuyingHandler } from './../control/cobuying/saveCoBuyingOneCTL';
import { ProductPriceHistory } from "@domain/product";
import { ProductInformation } from "@interface/product";
import AWS from "aws-sdk";
import { CreatePreviewPageDto } from "@interface/cobuying";

interface LambdaInterface {
  FunctionName: string; // 호출할 람다 함수의 이름
  InvocationType: string; // 람다 함수 호출 타입
  Payload: string; // 호출할 람다 함수에게 전달할 body를 문자열로 전달
}

class LambdaClient {
  private lambda: AWS.Lambda;
  private lambdaFunctionName: string;
  private invocationType: string;

  constructor(functionName?: string, invocationType?: string) {
    this.lambda = new AWS.Lambda({
      region: process.env.REGIONNAME
    });
    this.lambdaFunctionName = functionName || "";
    this.invocationType = invocationType || "";
  }

  /**
   * 상품 데이터를 기반으로 미리보기 페이지 비동기로 생성
   * params: 상품 데이터
   * return: 없음
   */
  createPreviewPage(createPreviewPageDto: CreatePreviewPageDto) {
    const params = {
      FunctionName: this.lambdaFunctionName,  // 하드코딩 제거 필요
      InvocationType: this.invocationType,
      Payload: JSON.stringify(createPreviewPageDto)
    };

    this.lambda.invoke(params, function(error, data) {
      if (error) {
        console.info(error);
      } else {
        console.info(data);
      }
    });
  }

  saveProductLedger(productInformation: ProductInformation) {
    const params = {
      FunctionName: process.env.LAMBDA_FUNCTION_NAME,  // 하드코딩 제거 필요
      InvocationType: 'Event',
      Payload: JSON.stringify(productInformation)
    };

    this.lambda.invoke({
      FunctionName: 'echoTest',
      Payload: JSON.stringify(params, null, 2) // pass params
    }, function(error, data) {
      if (error) {
        console.info(error);
      } else {
        console.info(data);
      }
    });
  }

  saveProductPriceHistory(history: ProductPriceHistory) {
    const params = {
      FunctionName: process.env.LAMBDA_FUNCTION_NAME, // {스테이징}+함수명으로 => 배포 단계에 따라 바뀔 수 있도록?
      InvocationType: 'Event',
      Payload: JSON.stringify(history)
    };

    this.lambda.invoke({
      FunctionName: 'echoTest',
      Payload: JSON.stringify(params, null, 2) // pass params
    }, function(error, data) {
      if (error) {
        console.info(error);
      } else {
        console.info(data);
      }
    });
  }
}
