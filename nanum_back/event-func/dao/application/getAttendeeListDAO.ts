import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { DivideType } from '@domain/cobuying';
import { Attendee } from '@domain/user';
import { CoBuyingDetail } from '@interface/cobuying';
import { CoBuyingApplication } from '@interface/application';
import { APIERROR } from 'common/responseType';
import { createDynamoDBDocClient } from 'dao/connect/createDDbDocClient';
import { mapToCoBuyingDetail } from 'mappers/mapCoBuyingDetail';

const ddbDocClient = createDynamoDBDocClient();

export const getAttendeeListDAO = async (ownerName: string, id: string): Promise<CoBuyingApplication> => {
    const params = {
        TableName: process.env.CoBuyingTableName || '', // 테이블 이름
        KeyConditionExpression: 'ownerName = :ownerName AND id = :id', // 쿼리 조건
        ExpressionAttributeValues: {
            ':ownerName': { S: ownerName }, // GSI 파티션 키 값
            ':id': { S: id }, // GSI 정렬 키 값
        },
    };
    try {
        const command = new QueryCommand(params);
        const result = await ddbDocClient.send(command);

        // 조회 결과가 없다면, 공구글을 찾을 수 없다는 에러를 던짐
        if (result.Items && result.Items.length > 0) {
            console.log(result.Items[0]);
            const cobuying: CoBuyingDetail = mapToCoBuyingDetail(result.Items[0]);
            const attendeeList: Attendee[] = cobuying.attendeeList || [];
            const coBuyingType: DivideType = cobuying.type;
            // CoBuyingSimple 인터페이스에 맞게 데이터를 매핑하여 반환
            return {
                attendeeList,
                coBuyingType,
            } as CoBuyingApplication;
            // 필요한 추가 로직
        } else {
            throw new APIERROR(404, '찾으시는 공구글이 존재하지 않아요');
        }
    } catch (error) {
        console.log('error', error);
        throw new Error('참석자 목록을 조회하는 중 오류가 발생했습니다.');
    }
};
