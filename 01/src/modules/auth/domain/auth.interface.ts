import type { Role } from "@/types/user"

export interface IRegisterUser {
  name: string
  email: string
  password: string
  role?: Role
}

export interface IUserEntity {
  id: string
  name: string
  email: string
  role: Role
  createdAt?: Date
  updatedAt?: Date
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<IUserEntity | null>
  create(data: IRegisterUser): Promise<IUserEntity>
}
