// export const queryCoBuyingWithPage = async (size: number, offset: number): Promise<CoBuyingSimple> => {
//     const params = {
//         TableName: process.env.CoBuyingTableName || '',
//     };
//     const command = new QueryCommand(params);
//     const result = await ddbDocClient.send(command);

//     // 조회 결과가 없다면, 공구글을 찾을 수 없다는 에러를 던짐
//     if (!result.Items) {
//         throw new Error('찾으시는 공구글이 존재하지 않아요');
//     }
// };
