import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { CoBuyingKey, CoBuyingSummary, CoBuyingDetail } from '@interface/cobuying';
import { PageingQueryDto, CoBuyingPageingRes } from '@cobuying/dto';
import { ICoBuyingRepository } from './ICoBuyingRepository';
import { DynamoDBClientFactory } from '@common/dynamodb';
import { QueryCoBuyingList, GetCoBuyingSummaryByOnwerNameAndId, GetCoBuyingDetailByOnwerNameAndId } from './query';
import { CreateCoBuying, UpdateCoBuying, DeleteCoBuying } from './command';
import { CoBuyingPost } from '@domain/cobuying';

/**
 * DynamoDB 구현체를 사용하는 CoBuying 데이터 저장소 어댑터
 */
export class CoBuyingDynamoDBAdapter implements ICoBuyingRepository {
  private readonly client: DynamoDBDocument;
  private readonly queryHandler: QueryCoBuyingList;
  private readonly getHandler: GetCoBuyingSummaryByOnwerNameAndId;
  private readonly createHandler: CreateCoBuying;
  private readonly updateHandler: UpdateCoBuying;
  private readonly deleteHandler: DeleteCoBuying;
  private readonly getDetailHandler: GetCoBuyingDetailByOnwerNameAndId;
  constructor() {
    this.client = DynamoDBClientFactory.getInstance();
    this.queryHandler = new QueryCoBuyingList(this.client);
    this.getHandler = new GetCoBuyingSummaryByOnwerNameAndId(this.client);
    this.createHandler = new CreateCoBuying(this.client);
    this.updateHandler = new UpdateCoBuying(this.client);
    this.deleteHandler = new DeleteCoBuying(this.client); 
    this.getDetailHandler = new GetCoBuyingDetailByOnwerNameAndId(this.client);
  }

  async queryCoBuyingList(queryDto: PageingQueryDto): Promise<CoBuyingPageingRes> {
    return this.queryHandler.execute(queryDto);
  }

  async getCoBuyingById(ownerName: string, id: string): Promise<CoBuyingSummary | null> {
    return this.getHandler.execute(ownerName, id);
  }

  async getCoBuyingDetailById(ownerName: string, id: string): Promise<CoBuyingDetail | null> {
    return this.getDetailHandler.execute(ownerName, id);
  }

  async createCoBuying(coBuying: CoBuyingPost): Promise<void> {
    await this.createHandler.execute(coBuying);
  }

  async updateCoBuying(key: CoBuyingKey, updateData: Partial<CoBuyingSummary>): Promise<void> {
    await this.updateHandler.execute(key, updateData);
  }

  async deleteCoBuying(key: CoBuyingKey): Promise<void> {
    await this.deleteHandler.execute(key);
  }
} 