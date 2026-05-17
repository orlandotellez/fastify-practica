import type { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";

export const authRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get("/register", authController.register)
}
