import type { Role, User } from "@/types/user"

export interface IRegisterUser {
  name: string
  email: string
  password: string
  role?: Role
}

export interface IAuthRepository {
  existingUser: (email: string) => Promise<any | null>
  createUser: (data: IRegisterUser) => Promise<User>
}
