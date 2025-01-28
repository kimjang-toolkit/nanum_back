import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ParticipationQuery } from '@interface/manage';
import { APIERROR } from 'common/responseType';
import { createDynamoDBDocClient } from 'dao/createDDbDocClient';

const ddbDocClient = createDynamoDBDocClient();

export const participationCoBuyingDAO = async (updateCommand: ParticipationQuery) => {
    const command = new UpdateCommand(updateCommand);
    try {
        const result = await ddbDocClient.send(command);
        console.log('result', result);
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
