import { ConflictError, NotFoundError, UnauthorizedError } from "@/core/errors/AppError"
import { comparePassword, generateVerificationCode, hashPassword } from "@/core/utils/crypto.utils"
import { generateTokens, verifyToken } from "@/core/utils/token.utils"
import type { IAuthRepository } from "../domain/auth.interface"
import type {
  IAuthResponse,
  IRefreshResponse,
  IVerificationResponse,
  ILogoutResponse,
  IUserSessionsResponse,
  ISessionResponse,
  IVerifyEmailResponse,
  IForgotPasswordResponse,
  IResetPasswordResponse
} from "../domain/auth.types"
import type { Role } from "@/types/auth"
import { env } from "@/config/env"
import type { ForgotPasswordPayloadDto, LoginPayloadDto, RegisterPayloadDto, ResetPasswordPayloadDto, VerifyEmailPayloadDto } from "../presentation/auth.dto"
import { mapUserToResponse } from "@/core/mappers/response.mapper"

// Token expiration times
//const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000 // 15 minutes
//const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days
const VERIFICATION_CODE_EXPIRY = 15 * 60 * 1000 // 15 minutes
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

export const createAuthService = (repository: IAuthRepository) => ({
  // REGISTER
  register: async (data: RegisterPayloadDto): Promise<IAuthResponse> => {
    const { name, email, password, role = "staff" } = data

    // Check if user already exists
    const existingUser = await repository.user.findByEmail(email)
    if (existingUser) {
      throw new ConflictError("Email already registered")
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user (not verified yet)
    const user = await repository.user.create({
      name,
      email,
      role,
      email_verified: false
    })

    // Create credentials account with password
    await repository.account.create({
      account_id: user.id, // Use user ID as account_id for credentials
      provider_id: "credentials",
      user_id: user.id,
      password: hashedPassword
    })

    // Generate verification code
    const verificationCode = generateVerificationCode()
    await repository.verification.create({
      identifier: email,
      value: verificationCode,
      expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY)
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as Role)

    // Create session in DB
    await repository.session.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY)
    })

    const response: IAuthResponse = {
      message: "User created successfully. Please verify your email.",
      user: mapUserToResponse(user),
      accessToken,
      refreshToken
    }

    return response
  },

  // LOGIN
  login: async (data: LoginPayloadDto): Promise<IAuthResponse> => {
    const { email, password } = data

    // Find the credentials account for this email
    const account = await repository.account.findCredentialsAccountByEmail(email)
    if (!account) {
      throw new UnauthorizedError("Invalid credentials")
    }

    // Verify password
    if (!account.password) {
      throw new UnauthorizedError("Invalid credentials")
    }
    const isValidPassword = await comparePassword(password, account.password)
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials")
    }

    // Get the user
    const user = await repository.user.findById(account.user_id!)
    if (!user) {
      throw new UnauthorizedError("User not found")
    }

    // If user is soft deleted, reject
    if (user.deleted_at) {
      throw new UnauthorizedError("Account has been deactivated")
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as Role)

    // Create session in DB
    await repository.session.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY)
    })

    const response: IAuthResponse = {
      message: "Login successfully",
      user: mapUserToResponse(user),
      accessToken,
      refreshToken
    }

    return response
  },

  // LOGOUT
  logout: async (refreshToken: string): Promise<ILogoutResponse> => {
    // Delete the session from DB
    await repository.session.delete(refreshToken)

    return {
      message: "Logged out successfully"
    }
  },

  // REFRESH
  refresh: async (refreshToken: string): Promise<IRefreshResponse> => {
    let payload: { userId: string }

    try {
      payload = verifyToken(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string }
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token")
    }

    // Find session in DB
    const session = await repository.session.findByToken(refreshToken)
    if (!session) {
      throw new UnauthorizedError("Invalid refresh token")
    }

    // Check if session is expired
    if (session.expires_at < new Date()) {
      await repository.session.delete(refreshToken)
      throw new UnauthorizedError("Session expired")
    }

    // Get user
    const user = await repository.user.findById(payload.userId)
    if (!user) {
      throw new UnauthorizedError("User not found")
    }

    // Delete old session
    await repository.session.delete(refreshToken)

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
      user.role as Role
    )

    // Create new session in DB
    await repository.session.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY)
    })

    const response: IRefreshResponse = {
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken
    }

    return response
  },

  // VERIFY EMAIL
  verifyEmail: async (data: VerifyEmailPayloadDto): Promise<IVerifyEmailResponse> => {
    const { identifier, code } = data

    // Find verification code
    const verification = await repository.verification.findByIdentifierAndValue(
      identifier,
      code
    )

    if (!verification) {
      throw new UnauthorizedError("Invalid verification code")
    }

    // Check if expired
    if (verification.expires_at < new Date()) {
      await repository.verification.deleteByIdentifier(identifier)
      throw new UnauthorizedError("Verification code expired")
    }

    // Find and update user
    const user = await repository.user.findByEmail(identifier)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Mark email as verified
    await repository.user.update(user.id, { email_verified: true })

    // Delete verification code
    await repository.verification.deleteByIdentifier(identifier)

    // Generate new tokens (user is now verified)
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role as Role
    )

    // Create new session
    await repository.session.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY)
    })

    const response: IVerifyEmailResponse = {
      message: "Email verified successfully",
      accessToken,
      refreshToken
    }

    return response
  },

  // FORGOT PASSWORD
  forgotPassword: async (data: ForgotPasswordPayloadDto): Promise<IForgotPasswordResponse> => {
    const { email } = data

    // Check if user exists
    const user = await repository.user.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: "If the email exists, a reset code has been sent",
        expires_at: new Date(Date.now() + VERIFICATION_CODE_EXPIRY)
      }
    }

    // Generate reset code
    const resetCode = generateVerificationCode()
    await repository.verification.create({
      identifier: `reset:${email}`,
      value: resetCode,
      expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY)
    })

    // TODO: Send email with reset code
    // For now, log it (in production, use an email service)
    console.log(`Password reset code for ${email}: ${resetCode}`)

    const response: IForgotPasswordResponse = {
      message: "If the email exists, a reset code has been sent",
      expires_at: new Date(Date.now() + VERIFICATION_CODE_EXPIRY)
    }

    return response
  },

  // RESET PASSWORD
  resetPassword: async (data: ResetPasswordPayloadDto): Promise<IResetPasswordResponse> => {
    const { email, code, newPassword } = data

    // Find verification
    const verification = await repository.verification.findByIdentifierAndValue(
      `reset:${email}`,
      code
    )

    if (!verification) {
      throw new UnauthorizedError("Invalid reset code")
    }

    if (verification.expires_at < new Date()) {
      await repository.verification.deleteByIdentifier(`reset:${email}`)
      throw new UnauthorizedError("Reset code expired")
    }

    // Find user and account
    const user = await repository.user.findByEmail(email)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Find credentials account
    const account = await repository.account.findCredentialsAccountByEmail(email)
    if (!account) {
      throw new NotFoundError("Account not found")
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword)
    await repository.account.update(account.id, { password: hashedPassword })

    // Delete all user sessions (force logout all devices)
    await repository.session.deleteByUserId(user.id)

    // Delete verification code
    await repository.verification.deleteByIdentifier(`reset:${email}`)

    const response: IResetPasswordResponse = {
      message: "Password reset successfully. Please login with your new password."
    }

    return response
  },

  // GET USER SESSIONS
  getUserSessions: async (userId: string): Promise<IUserSessionsResponse> => {
    const sessions = await repository.session.findByUserId(userId)

    // Filter out expired sessions
    const validSessions: ISessionResponse[] = sessions
      .filter(s => s.expires_at > new Date())
      .map(s => ({
        id: s.id,
        expires_at: s.expires_at,
        ip_address: s.ip_address,
        user_agent: s.user_agent,
        created_at: s.created_at,
        updated_at: s.updated_at
      }))

    const response: IUserSessionsResponse = {
      sessions: validSessions
    }

    return response
  },

  // REVOKE SESSION
  revokeSession: async (userId: string, sessionId: string): Promise<ILogoutResponse> => {
    const sessions = await repository.session.findByUserId(userId)
    const session = sessions.find(s => s.id === sessionId)

    if (!session) {
      throw new NotFoundError("Session not found")
    }

    await repository.session.delete(session.token)

    const response: ILogoutResponse = {
      message: "Session revoked successfully"
    }

    return response
  },

  // RESEND VERIFICATION EMAIL
  resendVerification: async (email: string): Promise<IVerificationResponse> => {
    const user = await repository.user.findByEmail(email)

    if (!user) {
      // Don't reveal if user exists
      return {
        message: "If the email exists, a new verification code has been sent",
        expires_at: new Date(Date.now() + VERIFICATION_CODE_EXPIRY)
      }
    }

    if (user.email_verified) {
      throw new ConflictError("Email already verified")
    }

    // Delete old verification if exists
    await repository.verification.deleteByIdentifier(email)

    // Generate new code
    const verificationCode = generateVerificationCode()
    await repository.verification.create({
      identifier: email,
      value: verificationCode,
      expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY)
    })

    // TODO: Send email
    console.log(`Verification code for ${email}: ${verificationCode}`)

    const response: IVerificationResponse = {
      message: "New verification code sent",
      expires_at: new Date(Date.now() + VERIFICATION_CODE_EXPIRY)
    }

    return response
  }
})
