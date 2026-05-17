import { ConflictError, UnauthorizedError } from "@/core/errors/AppError"
import { comparePassword, hashPassword } from "@/core/utils/crypto.utils"
import { generateTokens } from "@/core/utils/token.utils"
import type { IAuthRepository } from "../domain/auth.interface"
import type { IAuthResponse, ILoginPayload, IRegisterPayload } from "../domain/auth.types"
import type { Role } from "@/types/user"

export const createAuthService = (repository: IAuthRepository) => ({
  register: async (data: IRegisterPayload): Promise<IAuthResponse> => {
    const { name, email, password, role = "staff" } = data

    const existingUser = await repository.findByEmail(email)

    if (existingUser) {
      throw new ConflictError("Email already registered")
    }

    const hashedPassword = await hashPassword(password)

    const newUser = { name, email, password: hashedPassword, role }

    const user = await repository.create(newUser)

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role)

    const response: IAuthResponse = {
      message: "User create successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }

    return response
  },

  login: async (data: ILoginPayload): Promise<IAuthResponse> => {
    const { email, password } = data

    const user = await repository.findByEmail(email)

    if (!user) {
      throw new UnauthorizedError("Invalid credentials")
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials")
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as Role)

    const response: IAuthResponse = {
      message: "Login successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }

    return response
  }
})
