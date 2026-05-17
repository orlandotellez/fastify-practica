import { ConflictError } from "@/core/errors/AppError"
import { hashPassword } from "@/core/utils/crypto.utils"
import { generateTokens } from "@/core/utils/token.utils"
import type { IRegisterUser, IAuthRepository } from "../domain/auth.interface"

export const createAuthService = (repository: IAuthRepository) => ({
  register: async (data: IRegisterUser) => {
    const { name, email, password, role = "staff" } = data

    const existingUser = await repository.findByEmail(email)

    if (existingUser) {
      throw new ConflictError("Email already registered")
    }

    const hashedPassword = await hashPassword(password)

    const newUser = { name, email, password: hashedPassword, role }

    const user = await repository.create(newUser)

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  }
})
