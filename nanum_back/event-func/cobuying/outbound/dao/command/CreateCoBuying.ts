import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { CoBuyingSummary } from '@interface/cobuying';

export class CreateCoBuying {
  private readonly tableName = 'CoBuying';
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(coBuying: CoBuyingSummary): Promise<void> {
    await this.client.put({
      TableName: this.tableName,
      Item: coBuying,
    });
  }
} 