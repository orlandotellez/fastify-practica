import type { Account, Session, User, Verification } from "@/types/auth"

export type IUserEntity = Readonly<User>

export type IAccountEntity = Readonly<Account>

export type ISessionEntity = Readonly<Session>

export type IVerificationEntity = Readonly<Verification>

export type CreateUserData = Pick<IUserEntity, "name" | "email" | "role"> & {
  phone?: string
  image?: string
  email_verified?: boolean
}

export type UpdateUserData = Partial<Pick<IUserEntity, "name" | "phone" | "image" | "role" | "email_verified">>

export type CreateAccountData = Pick<IAccountEntity, "account_id" | "provider_id"> & {
  user_id?: string
  access_token?: string
  refresh_token?: string
  id_token?: string
  access_token_expires_at?: Date
  refresh_token_expires_at?: Date
  scope?: string
  password?: string
}

export type CreateSessionData = {
  userId: string
  token: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

export type CreateVerificationData = {
  identifier: string
  value: string
  expiresAt: Date
}
