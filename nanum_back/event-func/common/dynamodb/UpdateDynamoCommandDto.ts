import { ReturnValue } from "@aws-sdk/client-dynamodb";

export interface UpdateDynamoCommandDto {
  TableName: string;
  Key: Record<string, string>;
  UpdateExpression?: string;
  ConditionExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
  ReturnValues?: ReturnValue;
}

/**
 * 업데이트 쿼리 빌더 클래스  
 */
export class UpdateDynamoQueryBuilder {
  private dto: UpdateDynamoCommandDto;

  constructor() {
    this.dto = {
      TableName: '',
      Key: {},
    }
  }

  setTableName(tableName: string): UpdateDynamoQueryBuilder {
    this.dto.TableName = tableName;
    return this;
  }

  setKey(key: Record<string, string>): UpdateDynamoQueryBuilder {
    this.dto.Key = key;
    return this;
  }

  setUpdateExpression(updateExpression: string): UpdateDynamoQueryBuilder {
    this.dto.UpdateExpression = updateExpression;
    return this;
  }

  setConditionExpression(conditionExpression: string): UpdateDynamoQueryBuilder {
    this.dto.ConditionExpression = conditionExpression;
    return this;
  }

  setExpressionAttributeNames(expressionAttributeNames: Record<string, string>): UpdateDynamoQueryBuilder {
    this.dto.ExpressionAttributeNames = expressionAttributeNames;
    return this;
  }

  setExpressionAttributeValues(expressionAttributeValues: Record<string, any>): UpdateDynamoQueryBuilder {
    this.dto.ExpressionAttributeValues = expressionAttributeValues;
    return this;
  }

  setReturnValues(returnValues: ReturnValue): UpdateDynamoQueryBuilder {
    this.dto.ReturnValues = returnValues;
    return this;
  }

  build(): UpdateDynamoCommandDto {
    return this.dto;
  }

  toDynamoDBQueryInput(): {
    TableName: string;
    Key: Record<string, string>;
    UpdateExpression?: string;
    ConditionExpression?: string;
    ExpressionAttributeNames?: Record<string, string>;
    ExpressionAttributeValues?: Record<string, any>;
    ReturnValues?: ReturnValue;
  } {
    return {
      ...this.dto,
      ReturnValues: this.dto.ReturnValues || ReturnValue.ALL_NEW,
    };
  }
}