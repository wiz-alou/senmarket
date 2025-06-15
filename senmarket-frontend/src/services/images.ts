// src/services/images.ts
import { apiClient } from '@/lib/api';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

class ImagesService {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiClient.upload<UploadResponse>('/images/upload', formData);
  }

  async uploadMultipleImages(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    return apiClient.upload<UploadResponse[]>('/images/upload-multiple', formData);
  }

  async deleteImage(filename: string): Promise<void> {
    return apiClient.delete('/images/delete', {
      data: { filename }
    });
  }

  async validateImage(file: File): Promise<{ valid: boolean; error?: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiClient.upload('/images/validate', formData);
  }
}

export const imagesService = new ImagesService();