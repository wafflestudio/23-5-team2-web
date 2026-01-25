import { api } from './instance';

interface Email {
  email: string;
}

interface EmailResponse {
  emails: Email[];
}

export const getEmails = async (): Promise<EmailResponse> => {
  const response = await api.get<EmailResponse>('/v1/emails');
  return response.data;
};

export const addEmail = async (email: string): Promise<void> => {
  await api.post('/v1/emails', { email });
};

export const removeEmail = async (email: string): Promise<void> => {
  // DELETE requests with body need the 'data' property in config
  await api.delete('/v1/emails', {
    data: { email },
  });
};
