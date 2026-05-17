import type { Role } from "@/types/user"

export interface IRegisterPayload {
  name: string
  email: string
  password: string
  role?: Role
}

export interface ILoginPayload {
  email: string
  password: string
}

export interface IAuthResponse {
  message: string
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt?: Date;
  };
  accessToken: string;
  refreshToken: string;
}
