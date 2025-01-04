export const getKoreaTime = (): string => {
    const timestamp = new Date();
    const koreanTime = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000).toISOString(); // UTC에서 9시간을 더함
    return koreanTime;
};

export const getKoreaDay = (): string => {
    const timestamp = new Date();
    const koreanTime = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000).toISOString(); // UTC에서 9시간을 더함
    return koreanTime.split('T')[0];
};
