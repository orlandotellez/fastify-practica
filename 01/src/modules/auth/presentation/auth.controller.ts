import type { FastifyReply, FastifyRequest } from "fastify";

export const authController = {
  register: async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true
    })
  }
}
