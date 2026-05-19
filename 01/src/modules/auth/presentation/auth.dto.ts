import { z } from "zod"

// AUTH DTOs
export const RegisterPayloadDtoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email({ message: "Invalid email format" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "staff"]).optional()
})

export const LoginPayloadDtoSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  password: z.string().min(8, "Password must be at least 8 characters")
})

// VERIFICATION DTOs
export const VerifyEmailDtoSchema = z.object({
  identifier: z.email({ message: "Invalid email format" }),
  code: z.string().min(6, "Verification code must be at least 6 characters")
})

export const ResendVerificationDtoSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
})

// PASSWORD RESET DTOs
export const ForgotPasswordDtoSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
})

export const ResetPasswordDtoSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  code: z.string().min(6, "Reset code must be at least 6 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
})

// SESSION DTOs
export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
})

export const RevokeSessionDtoSchema = z.object({
  sessionId: z.uuid({ message: "Invalid session ID" })
})

// TYPE EXPORTS
export type RegisterPayloadDto = z.infer<typeof RegisterPayloadDtoSchema>
export type LoginPayloadDto = z.infer<typeof LoginPayloadDtoSchema>
export type VerifyEmailPayloadDto = z.infer<typeof VerifyEmailDtoSchema>
export type ResendVerificationPayloadDto = z.infer<typeof ResendVerificationDtoSchema>
export type ForgotPasswordPayloadDto = z.infer<typeof ForgotPasswordDtoSchema>
export type ResetPasswordPayloadDto = z.infer<typeof ResetPasswordDtoSchema>
export type RefreshTokenPayloadDto = z.infer<typeof RefreshTokenDtoSchema>
export type RevokeSessionPayloadDto = z.infer<typeof RevokeSessionDtoSchema>
