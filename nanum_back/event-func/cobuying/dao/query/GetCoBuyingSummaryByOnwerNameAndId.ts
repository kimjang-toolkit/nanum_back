import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { CoBuyingSummary } from '@interface/cobuying';

/**
 * 공구글 요약 조회 DAO
 * OwnerName과 Id를 기반으로 공구글 요약 조회
 */
export class GetCoBuyingSummaryByOnwerNameAndId {
  private readonly tableName = 'CoBuying';
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(ownerName: string, id: string): Promise<CoBuyingSummary | null> {
    const result = await this.client.get({
      TableName: this.tableName,
      Key: {
        ownerName: ownerName,
        id: id,
      },
    });

    return result.Item as CoBuyingSummary || null;
  }
} 