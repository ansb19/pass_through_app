import { http } from "@core/http/http";
import { CreateUserDto, UpdateUserDto, User } from "../models/user.model";

export type CheckDuplicate = 'nickname' | 'email' | 'phone';

// 회원가입
export async function signUpUser(dto: CreateUserDto): Promise<User> {
  const res = await http().post<User>("/users", dto);
  return res.data;
}

// 전체 사용자 조회
export async function getUsers(): Promise<User[]> {
  const res = await http().get<User[]>("/users");
  return res.data;
}

// 특정 사용자 조회
export async function getUser(id: string): Promise<User> {
  const res = await http().get<User>(`/users/${id}`);
  return res.data;
}

// 사용자 수정
export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  const res = await http().put<User>(`/users/${id}`, dto);
  return res.data;
}

// 사용자 삭제
export async function deleteUser(id: string): Promise<void> {
  await http().delete(`/users/${id}`);
}

//중복 확인
export async function check_duplicate_user(type: CheckDuplicate, value: string): Promise<{ isDuplicate: boolean }> {
  const res = await http().post<{ isDuplicate: boolean }>("/users/check-duplicate", { type, value });
  return res.data;
}
