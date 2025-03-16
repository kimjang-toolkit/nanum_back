import { ProductPriceHistory } from "@domain/product";
import { ProductInformation } from "@interface/product";
import AWS from "aws-sdk";

class LambdaClient {
  private lambda: AWS.Lambda;

  constructor() {
    this.lambda = new AWS.Lambda({
      region: process.env.REGIONNAME
    });
  }

  saveProductLedger(productInformation: ProductInformation) {
    const params = {
      FunctionName: process.env.LAMBDA_FUNCTION_NAME,
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
      FunctionName: process.env.LAMBDA_FUNCTION_NAME,
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
