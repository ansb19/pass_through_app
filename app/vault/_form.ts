// app/vault/_form.ts
import { VaultType } from '@/src/_constants/vaultTypes';

export interface FieldMeta {
    key: string;
    label: string;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'url' | 'visible-password' | 'number-pad';
    secureTextEntry?: boolean;
    multiline?: boolean;
}

/** 각 타입별 필드 정의 */
export const FIELDS: Record<VaultType, FieldMeta[]> = {
    account: [
        { key: 'urlOrName', label: '사이트/앱 이름 또는 URL', placeholder: '예: 우리은행 또는 https://...' },
        { key: 'username', label: '아이디', placeholder: '예: user@example.com', keyboardType: 'email-address' },
        { key: 'password', label: '비밀번호', placeholder: '••••••••', secureTextEntry: true, keyboardType: 'visible-password' },
        { key: 'note', label: '계정 메모', placeholder: '명의, 2차 인증 여부 등', multiline: true },
    ],
    card: [
        { key: 'number', label: '카드번호', placeholder: '1234-5678-9012-3456', keyboardType: 'number-pad' },
        { key: 'expiry', label: '유효기간', placeholder: 'MM/YY' },
        { key: 'name', label: '이름', placeholder: '카드 명의자' },
        { key: 'cvc', label: 'CVC', placeholder: '3자리', keyboardType: 'number-pad' },
        { key: 'brand', label: '카드사', placeholder: '예: 현대/신한/국민' },
        { key: 'note', label: '카드 메모', placeholder: '체크/신용, 혜택, 주 사용 용도 등', multiline: true },
    ],
    id: [
        { key: 'name', label: '이름', placeholder: '홍길동' },
        { key: 'regNo', label: '주민등록번호', placeholder: '000000-0000000', keyboardType: 'number-pad' },
        { key: 'address', label: '주소', placeholder: '주소' },
        { key: 'issuedAt', label: '발급일', placeholder: 'YYYY-MM-DD' },
        { key: 'note', label: '메모', placeholder: '추가 메모', multiline: true },
    ],
    license: [
        { key: 'licenseName', label: '자격/면허명', placeholder: '예: 운전면허 1종 보통' },
        { key: 'licenseNo', label: '면허/자격번호', placeholder: '번호' },
        { key: 'issuer', label: '발급기관', placeholder: '예: 도로교통공단' },
        { key: 'issuedAt', label: '발급일', placeholder: 'YYYY-MM-DD' },
        { key: 'expiresAt', label: '만료일(선택)', placeholder: 'YYYY-MM-DD' },
        { key: 'note', label: '메모', placeholder: '비고/특이사항', multiline: true },
    ],
    memo: [
        { key: 'title', label: '제목', placeholder: '예: 인터넷 뱅킹 보안메모' },
        { key: 'body', label: '내용', placeholder: '내용을 입력하세요', multiline: true },
    ],
    device: [
        { key: 'model', label: '모델명', placeholder: '예: iPhone 15 Pro' },
        { key: 'serial', label: '시리얼 번호', placeholder: '시리얼' },
        { key: 'purchasedAt', label: '구입 시기', placeholder: 'YYYY-MM-DD' },
        { key: 'warrantyUntil', label: 'AS 만료일', placeholder: 'YYYY-MM-DD' },
        { key: 'note', label: '기기 메모', placeholder: '특이사항', multiline: true },
    ],
    photo: [
        { key: 'title', label: '사진명', placeholder: '예: 여권 스캔본' },
        { key: 'file', label: '파일', placeholder: '파일을 선택하세요' },
        { key: 'note', label: '메모(선택)', placeholder: '촬영/스캔 관련 메모', multiline: true },
    ],
    other: [
        { key: 'title', label: '항목명', placeholder: '예: 시리얼/쿠폰 등' },
        { key: 'content', label: '내용', placeholder: '내용을 입력하세요', multiline: true },
    ],
};

export function createEmptyForm(type: VaultType) {
    return FIELDS[type].reduce<Record<string, string>>((acc, f) => {
        acc[f.key] = '';
        return acc;
    }, {});
}
