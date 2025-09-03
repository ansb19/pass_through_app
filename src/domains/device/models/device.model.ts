// src/domains/device/models/device.model.ts

export interface Device {
    id: string;
    user_id: string;
    device_id: string;
    device_name?: string;
    app_version?: string;
    public_key?: string;
    registered_at: string;
}
// 기기 등록 DTO
export type RegisterDeviceDto = {
    user_id: string;
    device_id: string;
    device_name?: string;
    public_key?: string;
    app_version?: string;
};

// 기기 수정 DTO
export type UpdateDeviceDto = Partial<RegisterDeviceDto>;