import { prisma } from "@/config/prisma";
import type { IAuthRepository } from "../domain/auth.interface";
import type { IRegisterPayload } from "../domain/auth.types";

export const AuthRepository: IAuthRepository = {
  async findByEmail(email: string) {
    return await prisma.user.findFirst({
      where: { email, deletedAt: null }
    })
  },
  async findById(id: string) {
    return await prisma.user.findFirst({
      where: { id, deletedAt: null }
    })
  },
  async create(data: IRegisterPayload) {
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
