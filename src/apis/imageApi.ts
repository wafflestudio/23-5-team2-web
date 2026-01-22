// apis/imageApi.ts
import { api } from './instance';

interface UploadImageResponse {
  url?: string;
}

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<UploadImageResponse>('/v1/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url || '';
};
