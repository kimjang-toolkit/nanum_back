import { CoBuyingKey, CoBuyingSummary } from "@interface/cobuying";

export interface PageingQueryDto {
  // 페이지네이션 기본 필드
  page: number;
  Limit: number;
  ScanIndexForward?: 'ASC' | 'DESC';

  // DynamoDB Query 필드
  TableName: string;
  IndexName?: string;
  KeyConditionExpression?: string;
  FilterExpression?: string;
  ExpressionAttributeValues?: Record<string, any>;
  ExclusiveStartKey?: Record<string, any>;
  ProjectionExpression?: string;
}

export class PageingQueryDtoBuilder {
  private dto: PageingQueryDto;

  constructor() {
    this.dto = {
      page: 1,
      Limit: 10,
      ScanIndexForward: 'DESC',
      TableName: '',
    };
  }

  setPage(page: number): PageingQueryDtoBuilder {
    this.dto.page = page;
    return this;
  }

  setSize(size: number): PageingQueryDtoBuilder {
    this.dto.Limit = size;
    return this;
  }

  setSortDirection(direction: 'ASC' | 'DESC'): PageingQueryDtoBuilder {
    this.dto.ScanIndexForward = direction;
    return this;
  }

  setTableName(tableName: string): PageingQueryDtoBuilder {
    this.dto.TableName = tableName;
    return this;
  }

  setIndexName(indexName: string): PageingQueryDtoBuilder {
    this.dto.IndexName = indexName;
    return this;
  }

  setKeyConditionExpression(expression: string): PageingQueryDtoBuilder {
    this.dto.KeyConditionExpression = expression;
    return this;
  }

  setFilterExpression(expression: string): PageingQueryDtoBuilder {
    this.dto.FilterExpression = expression;
    return this;
  }

  setExpressionAttributeValues(values: Record<string, any>): PageingQueryDtoBuilder {
    this.dto.ExpressionAttributeValues = values;
    return this;
  }

  setExclusiveStartKey(key: Record<string, any>): PageingQueryDtoBuilder {
    this.dto.ExclusiveStartKey = key;
    return this;
  }

  setProjectionExpression(expression: string): PageingQueryDtoBuilder {
    this.dto.ProjectionExpression = expression;
    return this;
  }

  build(): PageingQueryDto {
    return this.dto;
  }

  toDynamoDBQueryInput(): {
    TableName: string;
    IndexName?: string;
    KeyConditionExpression?: string;
    FilterExpression?: string;
    ExpressionAttributeValues?: Record<string, any>;
    ExclusiveStartKey?: Record<string, any>;
    ScanIndexForward?: boolean;
    ProjectionExpression?: string;
    Limit: number;
  } {
    return {
      ...this.dto,
      ScanIndexForward: this.dto.ScanIndexForward === 'ASC',
      Limit: this.dto.Limit
    };
  }
}

export interface CoBuyingPageingRes {
  coBuyingList: CoBuyingSummary[];
  lastEvaluatedKey?: CoBuyingKey;
  count: number;
}