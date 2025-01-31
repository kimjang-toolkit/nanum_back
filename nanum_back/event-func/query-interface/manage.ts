import { ReturnValue } from '@aws-sdk/client-dynamodb';

export interface ApplicationQuery {
    TableName: string;
    Key: Record<string, string>;
    UpdateExpression?: string;
    ConditionExpression?: string;
    ExpressionAttributeNames?: Record<string, string>;
    ExpressionAttributeValues?: Record<string, any>;
    ReturnValues?: ReturnValue;
}
