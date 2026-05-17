import type { FastifyReply, FastifyRequest } from "fastify";
import { createAuthService } from "../application/auth.service";
import { RegisterUserDtoSchema } from "./auth.dto";
import { AuthRepository } from "../infrastructure/auth.prisma.repository";

// Inyección de dependencias: el controller decide qué implementación usar
const authService = createAuthService(AuthRepository)

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = RegisterUserDtoSchema.parse(request.body)
    const result = await authService.register(data)
    return reply.status(201).send(result)
  }
}
