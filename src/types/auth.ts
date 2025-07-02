export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  customClaims?: {
    roles?: string[];
    [key: string]: unknown;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
} 