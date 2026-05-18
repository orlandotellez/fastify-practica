import type { FastifyReply, FastifyRequest } from "fastify";
import { createAuthService } from "../application/auth.service";
import { AuthRepository } from "../infrastructure/auth.prisma.repository";
import { LoginPayloadDtoSchema, RegisterPayloadDtoSchema } from "./auth.dto";
import { env } from "@/config/env";
import { clearAuthCookies, setAuthCookies } from "@/core/utils/cookie.utils";
import { ConflictError, UnauthorizedError } from "@/core/errors/AppError";
import { resolveCurrentUserId } from "@/core/utils/auth.utils";

// Inyección de dependencias: el controller decide qué implementación usar
const authService = createAuthService(AuthRepository)

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = RegisterPayloadDtoSchema.parse(request.body)

    const currentUserId = await resolveCurrentUserId(request, reply)

    if (currentUserId) {
      throw new ConflictError(
        "Already logged in. Please logout before creating a new account."
      )
    }

    const result = await authService.register(data)

    setAuthCookies(
      reply,
      result.accessToken,
      result.refreshToken,
      env.NODE_ENV === "production"
    )

    const response = {
      message: result.message,
      user: result.user
    }

    return reply.status(201).send(response)
  },

  login: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = LoginPayloadDtoSchema.parse(request.body)

    const currentUserId = await resolveCurrentUserId(request, reply)

    const result = await authService.login(data)

    if (currentUserId && currentUserId === result.user.id) {
      throw new ConflictError("Already logged in with this user. Please logout first.")
    }

    if (currentUserId && currentUserId !== result.user.id) {
      await clearAuthCookies(reply)
    }

    setAuthCookies(reply, result.accessToken, result.refreshToken, env.NODE_ENV === "production")

    const response = {
      message: result.message,
      user: result.user
    }

    return reply.status(200).send(response)
  },

  logout: async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await resolveCurrentUserId(request, reply)

    if (!userId) {
      throw new UnauthorizedError("No active session")
    }

    await clearAuthCookies(reply)

    const response = {
      message: "Logged out successfully"
    }

    return reply.status(200).send(response)
  }
}
