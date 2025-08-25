export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toApiError(e: any): AppError {
  if (e?.response) {
    const s = e.response.status;
    const code = e.response.data?.code ?? `HTTP_${s}`;
    const msg = e.response.data?.message ?? '요청 처리 중 오류가 발생했습니다.';
    return new AppError(code, msg, s, e);
  }
  if (e?.request) {
    return new AppError('NETWORK_ERROR', '네트워크 연결을 확인해주세요.', undefined, e);
  }
  return new AppError('UNKNOWN', e?.message ?? '알 수 없는 오류', undefined, e);
}
