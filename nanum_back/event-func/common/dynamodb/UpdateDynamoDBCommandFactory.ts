import { ReturnValue } from "@aws-sdk/client-dynamodb";

/**
 * T형식의 데이터를 저장하거나
 * Key에 데이터를 업데이트하거나
 * Condition으로 데이터를 조회할 수 있다.
 */
export interface UpdateDynamoDBCommandDto {
  TableName: string;
  Key?: Record<string, string>;
  UpdateExpression?: string;
  ConditionExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
  ReturnValues?: ReturnValue;
}

/**
 * 업데이트 쿼리 빌더 클래스  
 * 예시
 * const updateUserQuery = new UpdateDynamoQueryBuilder()
 *  .setTableName('UserTable')
 *  .setKey({id: '123'})
 *  .setUpdateExpression('SET #name = :name')
 *  .setExpressionAttributeNames({'#name': 'name'})
 *  .setExpressionAttributeValues({':name': 'John Doe'})
 *  .setConditionExpression('attribute_exists(#name)') // 조건 표현식, #name 속성이 없으면 업데이트 안됨
 *  .setReturnValues(ReturnValue.ALL_NEW) // 업데이트 후 반환되는 값
 *  .build();
 * 
 * 조회, 업데이트, 저장 모두를 사용할 수 있다.
 */
export class UpdateDynamoDBCommandFactory {
  private dto: UpdateDynamoDBCommandDto;

  constructor() {
    this.dto = {
      TableName: '',
      Key: {},
    }
  }

  setTableName(tableName: string): UpdateDynamoDBCommandFactory {
    this.dto.TableName = tableName;
    return this;
  }

  setKey(key: Record<string, string>): UpdateDynamoDBCommandFactory {
    this.dto.Key = key;
    return this;
  }

  setUpdateExpression(updateExpression: string): UpdateDynamoDBCommandFactory{
    this.dto.UpdateExpression = updateExpression;
    return this;
  }

  setConditionExpression(conditionExpression: string): UpdateDynamoDBCommandFactory {
    this.dto.ConditionExpression = conditionExpression;
    return this;
  }

  setExpressionAttributeNames(expressionAttributeNames: Record<string, string>): UpdateDynamoDBCommandFactory {
    this.dto.ExpressionAttributeNames = expressionAttributeNames;
    return this;
  }

  setExpressionAttributeValues(expressionAttributeValues: Record<string, any>): UpdateDynamoDBCommandFactory {
    this.dto.ExpressionAttributeValues = expressionAttributeValues;
    return this;
  }

  setReturnValues(returnValues: ReturnValue): UpdateDynamoDBCommandFactory {
    this.dto.ReturnValues = returnValues;
    return this;
  }

  build(): UpdateDynamoDBCommandDto {
    return this.dto;
  }

  toCommand(): {
    TableName: string;
    Key?: Record<string, string>;
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