import { Platform } from 'react-native';

// Next.js backend URL
// Untuk emulator Android, 10.0.2.2 mengarah ke localhost komputer host
// Sesuaikan alamat IP ini jika Anda menguji di perangkat fisik (misal: 192.168.1.x:3000)
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

export const endpoints = {
  services: `${API_BASE_URL}/api/services`,
  customers: `${API_BASE_URL}/api/customers`,
  orders: `${API_BASE_URL}/api/orders`,
  auth: `${API_BASE_URL}/api/auth`,
  analytics: `${API_BASE_URL}/api/owner/analytics`,
  remind: `${API_BASE_URL}/api/owner/remind`,
  midtransCreate: `${API_BASE_URL}/api/payments/midtrans/create`,
};
