import { http } from '@core/http/http';
import { ApiResult } from '@core/http/types';

export const ShareApi = {
  issueToken: async (payload: {
    ciphertext: string; nonce: string; salt: string; ttlSec: number;
  }): Promise<ApiResult<{ token: string; expiresAt: string }>> => {
    try {
      const res = await http().post('/share/issue', payload);
      return { ok: true, data: res.data };
    } catch (e: any) {
      return { ok: false, code: e.code, message: e.message, status: e.status };
    }
  },

  consumeToken: async (token: string): Promise<ApiResult<{ ciphertext: string; nonce: string; salt: string }>> => {
    try {
      const res = await http().post('/share/consume', { token });
      return { ok: true, data: res.data };
    } catch (e: any) {
      return { ok: false, code: e.code, message: e.message, status: e.status };
    }
  },
};
