import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { CoBuyingKey, CoBuyingSummary } from '@interface/cobuying';
import { PageingQueryDto, CoBuyingPageingRes, CreatedAtIdKey } from '@cobuying/dto';
import { mapToCoBuyingSummary, mapToCreatedAtIdKey } from '@cobuying/mapper';

export class QueryCoBuyingList {
  private readonly tableName = 'CoBuying';
  private readonly client: DynamoDBDocument;

  constructor(client: DynamoDBDocument) {
    this.client = client;
  }

  async execute(queryDto: PageingQueryDto): Promise<CoBuyingPageingRes> {
    const command = new QueryCommand({
      ...queryDto,
      TableName: this.tableName,
      ScanIndexForward: queryDto.ScanIndexForward === 'ASC',
    });

    const result = await this.client.send(command);
    
    return {
      coBuyingList: mapToCoBuyingSummary(result.Items) as CoBuyingSummary[],
      lastEvaluatedKey: mapToCreatedAtIdKey(result.LastEvaluatedKey) as CreatedAtIdKey,
      count: result.Count || 0,
    };
  }
} 