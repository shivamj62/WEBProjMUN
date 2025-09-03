// TypeScript declaration file for API module
declare module '@/lib/api' {
  export interface AuthCredentials {
    email: string;
    password: string;
  }

  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
  }

  export function getAuthCredentials(): AuthCredentials | null;
  export function saveAuthCredentials(credentials: AuthCredentials): void;
  export function removeAuthCredentials(): void;
  export function createAuthHeader(credentials?: AuthCredentials): Record<string, string>;
  export function apiCall(endpoint: string, options?: RequestInit): Promise<ApiResponse>;
  export function authenticatedApiCall(endpoint: string, options?: RequestInit): Promise<ApiResponse>;
  export function uploadFile(endpoint: string, formData: FormData): Promise<ApiResponse>;
  export function downloadFile(endpoint: string, filename: string): Promise<void>;

  export const API_ENDPOINTS: {
    AUTH: {
      CHECK_EMAIL: string;
      CREATE_ACCOUNT: string;
      LOGIN: string;
    };
    BLOGS: {
      LIST: string;
      GET: (id: string) => string;
      CREATE: string;
      UPDATE: (id: string) => string;
      DELETE: (id: string) => string;
    };
    RESOURCES: {
      LIST: string;
      UPLOAD: string;
      DOWNLOAD: (id: string) => string;
      DELETE: (id: string) => string;
    };
    ADMIN: {
      DASHBOARD_STATS: string;
      MEMBERS: string;
      MEMBER_UPDATE: (id: string) => string;
      MEMBER_DELETE: (id: string) => string;
      ADD_EMAIL: string;
      AUTHORS: string;
      CREATE_AUTHOR: string;
    };
    HEALTH: string;
  };
}
