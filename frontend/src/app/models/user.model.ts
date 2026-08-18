export interface UserRequest {
  name: string;
  type_document: 'DNI' | 'CNE' | string;
  number_document: string;
  email: string;
  cellphone: string;
  age: number;
  gender: 'M' | 'F';
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  type_document: string;
  number_document: string;
  email: string;
  cellphone: string;
  age: number;
  gender: string;
  status: boolean;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  path?: string;
  errors?: Record<string, string>;
  message?: string;
}
