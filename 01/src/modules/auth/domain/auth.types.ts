import type { IUserEntity } from "./auth.entities"

// RESPONSE TYPES
export interface IAuthResponse {
  message: string
  user: IUserEntity
  accessToken: string
  refreshToken: string
}

export interface IRefreshResponse {
  message: string
  accessToken: string
  refreshToken: string
}

export interface IVerifyEmailResponse {
  message: string
  accessToken: string
  refreshToken: string
}

export interface IForgotPasswordResponse {
  message: string
  expires_at: Date
}

export interface IVerificationResponse {
  message: string
  expires_at: Date
}

export interface IResetPasswordResponse {
  message: string
}

export interface ILogoutResponse {
  message: string
}

// SESSION TYPES
export interface ISessionResponse {
  id: string
  expires_at: Date
  ip_address?: string
  user_agent?: string
  created_at: Date
  updated_at: Date
}

export interface IUserSessionsResponse {
  sessions: ISessionResponse[]
}

// OAUTH TYPES
export interface IOAuthAccountData {
  provider: string // "google", "github", "credentials", etc.
  providerAccountId: string
  userId?: string
  access_token?: string
  refresh_token?: string
  id_token?: string
  access_token_expires_at?: Date
  refresh_token_expires_at?: Date
  scope?: string
  password?: string
}
