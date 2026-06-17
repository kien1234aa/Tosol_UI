export interface DeviceTokenRegisterPayload {
  token: string;
  device_type: 'ios' | 'android' | 'web';
  device_name: string;
}
