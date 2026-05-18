import type { FastifyReply, FastifyRequest } from "fastify"
import { clearAuthCookies } from "./cookie.utils"
import { env } from "@/config/env"
import jwt, { type JwtPayload } from "jsonwebtoken"

export const getUserIdFromCookies = (request: FastifyRequest): string | null => {
  const token = request.cookies.accessToken || request.cookies.refreshToken
  if (!token) return null

  try {
    // Intentar con JWT_SECRET primero (accessToken)
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    return decoded.userId
  } catch {
    // Si falla, intentar con JWT_REFRESH_SECRET (refreshToken)
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload
      return decoded.userId
    } catch {
      return null
    }
  }
}

export const resolveCurrentUserId = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<string | null> => {
  try {
    return getUserIdFromCookies(request)
  } catch {
    await clearAuthCookies(reply)
    return null
  }
}
