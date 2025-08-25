import { http } from '@core/http/http';
import { ApiResult, Paginated } from '@core/http/types';
import { VaultItem, VaultType } from '../models/vault.models';

export type CreateVaultReq = {
  type: VaultType;
  title: string;
  ciphertext: string; // AES-GCM
  nonce: string;
  salt: string;
  meta?: Record<string, string>;
};

export const VaultApi = {
  list: async (page = 1, pageSize = 20): Promise<ApiResult<Paginated<VaultItem>>> => {
    try {
      const res = await http().get('/vault', { params: { page, pageSize } });
      return { ok: true, data: res.data };
    } catch (e: any) {
      return { ok: false, code: e.code, message: e.message, status: e.status };
    }
  },

  create: async (body: CreateVaultReq): Promise<ApiResult<{ id: string }>> => {
    try {
      const res = await http().post('/vault', body);
      return { ok: true, data: res.data };
    } catch (e: any) {
      return { ok: false, code: e.code, message: e.message, status: e.status };
    }
  },

  remove: async (id: string): Promise<ApiResult<true>> => {
    try {
      await http().delete(`/vault/${id}`);
      return { ok: true, data: true };
    } catch (e: any) {
      return { ok: false, code: e.code, message: e.message, status: e.status };
    }
  },
};
