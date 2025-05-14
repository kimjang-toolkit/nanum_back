import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { CoBuyingKey, CoBuyingSummary } from '@interface/cobuying';
import { PageingQueryDto, CoBuyingPageingRes } from '../../dto/PageingQueryDto';

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
      coBuyingList: (result.Items || []) as unknown as CoBuyingSummary[],
      lastEvaluatedKey: result.LastEvaluatedKey as unknown as CoBuyingKey,
      count: result.Count || 0,
    };
  }
} 