import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { ITempRepository } from './ITempRepository';
import { DynamoDBClientFactory } from '@common/dynamodb';

/**
 * DynamoDB 구현체를 사용하는 CoBuying 데이터 저장소 어댑터
 */
export class TempDynamoDBAdapter implements ITempRepository {
  private readonly client: DynamoDBDocument;
  // 함수 구현체들을 의존하는 부분

  
  constructor() {
    this.client = DynamoDBClientFactory.getInstance();
    
  }

} 