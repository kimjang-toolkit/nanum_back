export const getKoreaTime = (): Date => {
    const timestamp = new Date();
    const koreanTime = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000); // UTC에서 9시간을 더함
    return koreanTime;
};

export function getFormattedKoreaTime(): string {
    const timestamp = new Date();
    const koreanTime = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000); // UTC에서 9시간을 더함

    const year = koreanTime.getFullYear();
    const month = String(koreanTime.getMonth() + 1).padStart(2, '0');
    const day = String(koreanTime.getDate()).padStart(2, '0');
    const hours = String(koreanTime.getHours()).padStart(2, '0');
    const minutes = String(koreanTime.getMinutes()).padStart(2, '0');
    const seconds = String(koreanTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export const getKoreaDay = (): string => {
    const timestamp = new Date();
    const koreanTime = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000).toISOString(); // UTC에서 9시간을 더함
    return koreanTime.split('T')[0];
};
