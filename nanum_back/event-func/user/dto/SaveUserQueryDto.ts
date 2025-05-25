import { UserMaster } from "@domain/user";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

/**
 * 사용자 저장 쿼리 인터페이스
 */
export interface SaveUserQueryDto {
  // DynamoDB PutItem 필드
  TableName: string;
  Item: UserMaster;
  ConditionExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
}

/**
 * 사용자 저장 쿼리 빌더 클래스
 */
export class SaveUserQueryDtoBuilder {
  private dto: SaveUserQueryDto;

  constructor() {
    this.dto = {
      TableName: '',
      Item: {} as UserMaster,
    };
  }

  setTableName(tableName: string): SaveUserQueryDtoBuilder {
    this.dto.TableName = tableName;
    return this;
  }

  setItem(user: UserMaster): SaveUserQueryDtoBuilder {
    this.dto.Item = user;
    return this;
  }

  setConditionExpression(expression: string): SaveUserQueryDtoBuilder {
    this.dto.ConditionExpression = expression;
    return this;
  }

  setExpressionAttributeNames(names: Record<string, string>): SaveUserQueryDtoBuilder {
    this.dto.ExpressionAttributeNames = names;
    return this;
  }

  setExpressionAttributeValues(values: Record<string, any>): SaveUserQueryDtoBuilder {
    this.dto.ExpressionAttributeValues = values;
    return this;
  }

  build(): SaveUserQueryDto {
    return this.dto;
  }

  toDynamoDBPutItemInput(): PutCommand {
    return new PutCommand({
      ...this.dto
    });
  }
}
