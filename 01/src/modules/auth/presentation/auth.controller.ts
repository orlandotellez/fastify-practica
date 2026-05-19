import type { FastifyReply, FastifyRequest } from "fastify"
import { createAuthService } from "../application/auth.service"
import { AuthRepository } from "../infrastructure/auth.prisma.repository"
import {
  LoginPayloadDtoSchema,
  RegisterPayloadDtoSchema,
  VerifyEmailDtoSchema,
  ForgotPasswordDtoSchema,
  ResetPasswordDtoSchema,
  ResendVerificationDtoSchema,
  RevokeSessionDtoSchema
} from "./auth.dto"
import { env } from "@/config/env"
import { clearAuthCookies, setAuthCookies } from "@/core/utils/cookie.utils"
import { AppError, ConflictError, UnauthorizedError } from "@/core/errors/AppError"
import { resolveCurrentUserId } from "@/core/utils/auth.utils"
import { getRefreshToken } from "@/core/utils/token.utils"
import type { IAuthResponse, IForgotPasswordResponse, ILogoutResponse, IRefreshResponse, IResetPasswordResponse, IUserSessionsResponse, IVerificationResponse, IVerifyEmailResponse } from "../domain/auth.types"

// Inyección de dependencias: el controller decide qué implementación usar
const authService = createAuthService(AuthRepository)

export const authController = {
  // REGISTER
  register: async (request: FastifyRequest, reply: FastifyReply): Promise<IAuthResponse | AppError> => {
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

    const response: IAuthResponse = {
      message: result.message,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }

    return reply.status(201).send(response)
  },

  // LOGIN
  login: async (request: FastifyRequest, reply: FastifyReply): Promise<IAuthResponse | AppError> => {
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

    const response: IAuthResponse = {
      message: result.message,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }

    return reply.status(200).send(response)
  },

  // LOGOUT
  logout: async (request: FastifyRequest, reply: FastifyReply): Promise<ILogoutResponse | AppError> => {
    const refreshToken = getRefreshToken(request)

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required")
    }

    const result = await authService.logout(refreshToken)

    clearAuthCookies(reply)

    return reply.status(200).send(result)
  },

  // REFRESH
  refresh: async (request: FastifyRequest, reply: FastifyReply): Promise<IRefreshResponse | AppError> => {
    const refreshToken = getRefreshToken(request)

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required")
    }

    const result = await authService.refresh(refreshToken)

    setAuthCookies(reply, result.accessToken, result.refreshToken, env.NODE_ENV === "production")

    const response: IRefreshResponse = {
      message: result.message,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }

    return reply.status(200).send(response)
  },

  // VERIFY EMAIL
  verifyEmail: async (request: FastifyRequest, reply: FastifyReply): Promise<IVerifyEmailResponse | AppError> => {
    const data = VerifyEmailDtoSchema.parse(request.body)

    const result = await authService.verifyEmail(data)

    setAuthCookies(reply, result.accessToken, result.refreshToken, env.NODE_ENV === "production")

    const response: IVerifyEmailResponse = {
      message: result.message,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }

    return reply.status(200).send(response)
  },

  // RESEND VERIFICATION
  resendVerification: async (request: FastifyRequest, reply: FastifyReply): Promise<IVerificationResponse | AppError> => {
    const data = ResendVerificationDtoSchema.parse(request.body)

    const result = await authService.resendVerification(data.email)

    const response = {
      message: result.message
    }

    return reply.status(200).send(response)
  },

  // FORGOT PASSWORD
  forgotPassword: async (request: FastifyRequest, reply: FastifyReply): Promise<IForgotPasswordResponse | AppError> => {
    // Check if user is already logged in
    const currentUserId = await resolveCurrentUserId(request, reply)
    if (currentUserId) {
      throw new ConflictError("Please logout before requesting password reset")
    }

    const data = ForgotPasswordDtoSchema.parse(request.body)

    const result = await authService.forgotPassword(data)

    return reply.status(200).send(result)
  },

  // RESET PASSWORD
  resetPassword: async (request: FastifyRequest, reply: FastifyReply): Promise<IResetPasswordResponse | AppError> => {
    // Check if user is already logged in
    const currentUserId = await resolveCurrentUserId(request, reply)
    if (currentUserId) {
      throw new ConflictError("Please logout before resetting password")
    }

    const data = ResetPasswordDtoSchema.parse(request.body)

    const result = await authService.resetPassword(data)

    clearAuthCookies(reply)

    return reply.status(200).send(result)
  },

  // GET USER SESSIONS (Protected)
  getUserSessions: async (request: FastifyRequest, reply: FastifyReply): Promise<IUserSessionsResponse | AppError> => {
    const userId = await resolveCurrentUserId(request, reply)

    if (!userId) {
      throw new UnauthorizedError("Authentication required")
    }

    const result = await authService.getUserSessions(userId)

    return reply.status(200).send(result)
  },

  // REVOKE SESSION (Protected)
  revokeSession: async (request: FastifyRequest, reply: FastifyReply): Promise<ILogoutResponse | AppError> => {
    const userId = await resolveCurrentUserId(request, reply)

    if (!userId) {
      throw new UnauthorizedError("Authentication required")
    }

    const params = request.params as { sessionId: string }
    const { sessionId } = RevokeSessionDtoSchema.parse(params)

    const result = await authService.revokeSession(userId, sessionId)

    return reply.status(200).send(result)
  }
}
