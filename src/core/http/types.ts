export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; code: string; message: string; status?: number };
export type ApiResult<T> = ApiOk<T> | ApiFail;

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
