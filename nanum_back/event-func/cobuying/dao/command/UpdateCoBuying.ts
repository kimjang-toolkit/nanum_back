import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { CoBuyingKey, CoBuyingSummary } from '@interface/cobuying';

export class UpdateCoBuying {
  private readonly tableName = 'CoBuying';
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(key: CoBuyingKey, updateData: Partial<CoBuyingSummary>): Promise<void> {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'pk' && key !== 'sk') { // 파티션 키와 정렬 키는 업데이트하지 않음
        const attributeName = `#${key}`;
        const attributeValue = `:${key}`;
        
        updateExpressions.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeValues[attributeValue] = value;
        expressionAttributeNames[attributeName] = key;
      }
    });

    if (updateExpressions.length === 0) {
      return;
    }

    await this.client.update({
      TableName: this.tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
    });
  }
} 