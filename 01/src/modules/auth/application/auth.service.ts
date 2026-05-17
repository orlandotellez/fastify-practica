import { ConflictError } from "@/core/errors/AppError"
import type { Role } from "@/types/user"
import { hashPassword } from "@/core/utils/crypto.utils"
import { generateTokens } from "@/core/utils/token.utils"
import type { IRegisterUser } from "../domain/auth.interface"
import { AuthRepository } from "../infrastructure/auth.repository.ts"

export const AuthService = {
  register: async (data: IRegisterUser) => {
    const { name, email, password, role = "staff" } = data

    const existingUser = await AuthRepository.existingUser(email)

    if (existingUser) {
      throw new ConflictError("Email already registered")
    }

    const hashedPassword = await hashPassword(password)

    const newUser = { name, email, password: hashedPassword, role }

    const user = await AuthRepository.createUser(newUser)

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as Role)

    const response = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role
      },
      accessToken,
      refreshToken
    }

    return response
  }
}
