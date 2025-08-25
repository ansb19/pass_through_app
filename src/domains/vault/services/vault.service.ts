import { CreateVaultReq, VaultApi } from '../api/vault.api';
import { VaultItem } from '../models/vault.models';

export const VaultService = {
  async list(): Promise<VaultItem[]> {
    const r = await VaultApi.list(1, 20);
    if (!r.ok) throw new Error(r.message);
    return r.data.items;
  },

  async createSecureItem(req: CreateVaultReq): Promise<string> {
    const r = await VaultApi.create(req);
    if (!r.ok) throw new Error(r.message);
    return r.data.id;
  },

  async remove(id: string): Promise<void> {
    const r = await VaultApi.remove(id);
    if (!r.ok) throw new Error(r.message);
  },
};
