// PublicUser: 서버에서 암호화 필드 제외하고 내려주는 사용자
export interface User {
    id: string;
    email: string;
    phone: string;
    nickname: string;
    birth: string;
    is_email_verified: boolean;
    is_sms_verified: boolean;
    created_at: string;
    updated_at: string;
}

// 회원가입 DTO (서버 요구사항에 맞춤)
export interface CreateUserDto {
    email: string;
    phone: string;
    nickname: string;
    birth: string;
    enc: {
        algo: "AES-GCM";
        kdf: "PBKDF2";
        iterations: number;
        digest: "SHA-256" | "SHA-512";
        keyLength: number;
        ciphertext_b64: string;
        salt_b64: string;
        nonce_b64: string;
        version?: string;
    };
}

// 회원정보 수정 DTO
export type UpdateUserDto = Partial<Pick<User, "email" | "phone" | "nickname" | "birth">>;
