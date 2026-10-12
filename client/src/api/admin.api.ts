import { apiClient } from './client';

// Fungsi untuk memicu proses scraping di server
export const triggerSync = async (componentId?: string) => {
    // Kirim payload ke backend
    const response = await apiClient.post('/sync/trigger', {
        componentId: componentId || 'ALL'
    });
    return response.data;
};
// Fungsi untuk membuat komponen baru secara manual
// Sesuaikan 'ComponentData' dengan tipe/interface datamu (misal Omit<Component, 'id'>)
export const createComponent = async (data: any) => {
    const response = await apiClient.post('/components', data);
    return response.data;
};