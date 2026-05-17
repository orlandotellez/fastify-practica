import { prisma } from "@/config/prisma";
import type { IAuthRepository, IRegisterUser } from "../domain/auth.interface";

export const AuthRepository: IAuthRepository = {
  existingUser: async (email: string) => {
    return await prisma.user.findFirst({
      where: { email, deletedAt: null }
    })
  },
  createUser: async (data: IRegisterUser) => {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      }
    })
  }
}
