import * as userApi from "../api/user.api";

import { CreateUserDto, UpdateUserDto, User } from "../models/user.model";

export class UserService {
    // 회원가입
    static async signUp(dto: CreateUserDto): Promise<User> {
        // TODO: 클라이언트에서 PIN으로 enc 번들 생성 → dto.enc에 넣어서 호출
        return userApi.signUpUser(dto);
    }

    // 전체 조회
    static async list(): Promise<User[]> {
        return userApi.getUsers();
    }

    // 단일 조회
    static async detail(id: string): Promise<User> {
        return userApi.getUser(id);
    }

    // 수정
    static async update(id: string, dto: UpdateUserDto): Promise<User> {
        return userApi.updateUser(id, dto);
    }

    // 삭제
    static async remove(id: string): Promise<void> {
        return userApi.deleteUser(id);
    }

    static async checkDuplicate(type: userApi.CheckDuplicate, value: string): Promise<{ isDuplicate: boolean }> {
        return userApi.check_duplicate_user(type, value);
    }
}
