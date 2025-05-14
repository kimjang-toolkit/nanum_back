import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { CoBuyingDetail } from '@interface/cobuying'; 

/**
 * 공구글 상세 조회 DAO
 * OwnerName과 Id를 기반으로 공구글 상세 조회
 */
export class GetCoBuyingDetailByOnwerNameAndId {
  private readonly tableName = 'CoBuying';
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(ownerName: string, id: string): Promise<CoBuyingDetail | null> {
    const result = await this.client.get({
      TableName: this.tableName,
      Key: {
        ownerName: ownerName,
        id: id,
      },
    });

    return result.Item as CoBuyingDetail | null;
  }
}
