import type { FastifyReply, FastifyRequest } from "fastify";
import { createAuthService } from "../application/auth.service";
import { AuthRepository } from "../infrastructure/auth.prisma.repository";
import { LoginPayloadDtoSchema, RegisterPayloadDtoSchema } from "./auth.dto";

// Inyección de dependencias: el controller decide qué implementación usar
const authService = createAuthService(AuthRepository)

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = RegisterPayloadDtoSchema.parse(request.body)
    const result = await authService.register(data)
    return reply.status(201).send(result)
  },

  login: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = LoginPayloadDtoSchema.parse(request.body)
    const result = await authService.login(data)
    return reply.status(200).send(result)
  }
}
