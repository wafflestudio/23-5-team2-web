export interface User {
  id: number;
  localId: string;
  oauthId: string;
  oauthProvider: string;
  role: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  userId: string;
  password: string;
}
