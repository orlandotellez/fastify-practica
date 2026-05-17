import type { Role } from "@/types/user"

export interface IUserEntity {
  id: string
  name: string
  email: string
  password: string
  role: Role
  createdAt?: Date
  updatedAt?: Date
}

