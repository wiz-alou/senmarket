import { apiClient } from '../client';
import { ApiResponse } from '../types';

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}

export class ImagesService {
  async uploadImage(file: File): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<UploadedImage>>(
      '/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  async uploadMultipleImages(files: File[]): Promise<UploadedImage[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await apiClient.post<ApiResponse<UploadedImage[]>>(
      '/images/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  async validateImage(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      await apiClient.post('/images/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteImage(imagePath: string): Promise<void> {
    await apiClient.delete('/images/delete', {
      params: { path: imagePath }
    });
  }
}

export const imagesService = new ImagesService();