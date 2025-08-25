import { IconToken } from "@/app/_components/TabChips";

// 공통 상수 (두 파일 모두 동일하게)
export type VaultType = 'account' | 'card' | 'id' | 'license' | 'memo' | 'device' | 'photo' | 'other';

export const TYPES: { key: VaultType; label: string; icon: IconToken }[] = [
    { key: 'account', label: '계정', icon: 'person-circle' },
    { key: 'card', label: '카드', icon: 'card' },
    { key: 'id', label: '신분증', icon: 'mdi:id' },
    { key: 'license', label: '면허/자격', icon: 'ribbon' },
    { key: 'memo', label: '보안메모', icon: 'document-text' },
    { key: 'device', label: '내 기기', icon: 'hardware-chip' }, // ✅ 통일
    { key: 'photo', label: '내 사진', icon: 'image' },
    { key: 'other', label: '기타', icon: 'cube' },
];
