// src/domains/device/api/device.api.ts

import { http } from '@/src/core/http/http';
import { Device, RegisterDeviceDto, UpdateDeviceDto } from '../models/device.model';


export async function registerDevice(dto: RegisterDeviceDto) {
    const res = await http().post<Device>('/devices', dto);
    return res.data;
};

export async function getMyDevice() {
    const res = await http().get<Device | null>('/devices');
    return res.data;
};

export async function removeDevice(device_id: string) {
    await http().delete(`/devices/${device_id}`);
    return true;
};

export async function updateDevice(device_id: string, dto: UpdateDeviceDto) {
    const res = await http().patch<Device>(`/devices/${device_id}`, dto);
    return res.data;
};

