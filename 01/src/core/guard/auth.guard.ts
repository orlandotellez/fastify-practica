import type { FastifyReply, FastifyRequest } from "fastify"
import { UnauthorizedError } from "@/core/errors/AppError"
import { getUserIdFromCookies } from "../utils/auth.utils"

declare module "fastify" {
  interface FastifyRequest {
    userId?: string
  }
}

export const authGuard = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const userId = getUserIdFromCookies(request)

  if (!userId) {
    throw new UnauthorizedError("Authentication required")
  }

  request.userId = userId
}
