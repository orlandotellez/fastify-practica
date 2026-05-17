import { env } from "@/config/env"
import type { Role } from "@/types/user"
import type { SignOptions } from "jsonwebtoken"
import jwt from "jsonwebtoken"

interface TokenPayload {
  userId: string
  email: string
  role: Role
}

export const generateTokens = (userId: string, email: string, role: Role) => {
  const accessTokenOptions: SignOptions = {
    expiresIn: 900
  }

  const refreshTokenOptions: SignOptions = {
    expiresIn: 604000
  }

  const accessToken = jwt.sign(
    { userId, email, role } as TokenPayload,
    env.JWT_SECRET,
    accessTokenOptions
  )

  const refreshToken = jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    refreshTokenOptions
  )

  return { accessToken, refreshToken }
}

