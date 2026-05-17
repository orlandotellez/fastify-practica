import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../application/auth.service";
import { RegisterUserDtoSchema } from "./auth.dto";

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = RegisterUserDtoSchema.parse(request.body)
    const result = await AuthService.register(data)
    return reply.status(201).send(result)
  }
}
