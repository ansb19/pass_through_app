export type VaultType = 'account' | 'card' | 'id' | 'license' | 'memo' | 'device' | 'other';

export type VaultItem = {
  id: string;
  type: VaultType;
  title: string;
  masked: string;
  updatedAt: string;
};
