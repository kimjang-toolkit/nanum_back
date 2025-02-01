import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ApplicationQuery } from '@query-interface/application';
import { APIERROR } from 'common/responseType';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';

const ddbDocClient = createDynamoDBDocClient();

export const applicationCoBuyingDAO = async (updateCommand: ApplicationQuery) => {
    const command = new UpdateCommand(updateCommand);
    try {
        const result = await ddbDocClient.send(command);
        console.log('result', result);
        if (result.$metadata && result.$metadata.httpStatusCode && result.$metadata.httpStatusCode !== 200) {
            // 메시지가 없으면 디폴트 메시지 출력
            throw new APIERROR(result.$metadata.httpStatusCode, '신청 할 수 없어요. 다시 시도해주세요.');
        }
    } catch (error) {
        console.log('error', error);
        if ((error as Error).name === 'ConditionalCheckFailedException') {
            throw new APIERROR(400, '신청 가능 수량이 부족합니다.');
        } else if ((error as Error).name === 'ValidationException') {
            throw new APIERROR(400, (error as Error).message);
        }
    }

    // return result;
};
