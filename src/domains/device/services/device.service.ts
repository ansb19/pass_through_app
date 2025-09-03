// src/domains/device/services/device.service.ts
import * as DeviceApi from "../api/device.api";
import { Device, RegisterDeviceDto, UpdateDeviceDto } from '../models/device.model';

export class DeviceService {

    static async register(dto: RegisterDeviceDto): Promise<Device> {
        return await DeviceApi.registerDevice(dto);
    }

    static async get(): Promise<Device | null> {
        return await DeviceApi.getMyDevice();
    }

    static async removeDevice(device_id: string): Promise<boolean> {
        return await DeviceApi.removeDevice(device_id);
    }

    static async update(device_id: string, dto: UpdateDeviceDto): Promise<Device> {
        return await DeviceApi.updateDevice(device_id, dto);
    }
}
