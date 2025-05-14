import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { CoBuyingKey } from '@interface/cobuying';

export class DeleteCoBuying {
  private readonly tableName = 'CoBuying';
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(key: CoBuyingKey): Promise<void> {
    await this.client.delete({
      TableName: this.tableName,
      Key: key,
    });
  }
} 