import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIERROR } from 'common/responseType';
import { UpdateDynamoQuery } from '@query-interface/application';
import { createDynamoDBDocClient } from 'dao/connect/createDDbDocClient';
import { ManageCoBuyingDto } from '@interface/manage';

const ddbDocClient = createDynamoDBDocClient();

export const manageCoBuyingDAO = async (updateCommand: UpdateDynamoQuery): Promise<ManageCoBuyingDto> => {
    try {
        const command = new UpdateCommand(updateCommand);
        const result = await ddbDocClient.send(command);
        console.log('result', result);
        if (result.$metadata && result.$metadata.httpStatusCode && result.$metadata.httpStatusCode !== 200) {
            // 메시지가 없으면 디폴트 메시지 출력
            throw new APIERROR(result.$metadata.httpStatusCode, '공구글을 수정할 수 없어요. 다시 시도해주세요.');
        }
        return {
            message: '정상적으로 수정되었습니다.',
        } as ManageCoBuyingDto;
    } catch (error) {
        console.log('error', error);
        if ((error as Error).name === 'ValidationException') {
            throw new APIERROR(400, (error as Error).message);
        } else {
            throw new APIERROR(500, 'DB 업데이트 중 오류가 발생했습니다.');
        }
    }
};