import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export class DynamoDBClientFactory {
  private static instance: DynamoDBDocument;

  private constructor() {}

  static getInstance(): DynamoDBDocument {
    if (!this.instance) {
      const client = new DynamoDBClient({
        endpoint: {
          hostname: process.env.DYNAMODBHOST || 'host.docker.internal:3300',
          path: '',
          protocol: process.env.DBPROTOCAL || 'http:',
        },
        region: process.env.REGIONNAME || 'ap-northeast-2',
      });

      this.instance = DynamoDBDocument.from(client);
    }

    return this.instance;
  }
} 