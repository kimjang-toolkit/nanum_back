import { createHmac, timingSafeEqual } from 'crypto';

const SECRET_KEY = process.env.AUTHSECRETKEY || 'your-secret-key'; // 서버에서만 관리

// 비밀번호 해싱 함수
export async function hashPassword(password: string): Promise<string> {
    // 비밀키를 사용해 HMAC 생성 => 인증키 + 해싱
    const hashedPassword = createHmac('sha256', SECRET_KEY).update(password).digest('hex');
    return hashedPassword;
}

// 비밀번호 검증 함수
export function verifyPassword(inputPassword: string, storedHash: string): boolean {
    const hashedInputPassword = createHmac('sha256', SECRET_KEY).update(inputPassword).digest('hex');

    // 문자열 비교 (타이밍 공격 방지)
    const inputBuffer = Buffer.from(hashedInputPassword);
    const storedBuffer = Buffer.from(storedHash);

    if (inputBuffer.length !== storedBuffer.length) {
        return false; // 길이가 다르면 즉시 false
    }

    return timingSafeEqual(inputBuffer, storedBuffer);
}
