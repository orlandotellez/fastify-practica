import { authRoutes } from "@/modules/auth/presentation/auth.routes";
import { type FastifyInstance } from "fastify";

export const routes = async (fastify: FastifyInstance, _option: any) => {
  fastify.register(authRoutes, { prefix: "/auth" })
}
