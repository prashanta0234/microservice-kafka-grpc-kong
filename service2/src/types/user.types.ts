// Type definitions for User gRPC service based on proto file

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

// Request types for better type safety
export interface GetUserRequest {
  id: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
}

export interface DeleteUserRequest {
  id: string;
}

export interface GetAllUsersRequest {
  page?: number;
  limit?: number;
}
