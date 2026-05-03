export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  isProfileCompleted: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}
