import type { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";

export const authRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.post("/register", authController.register)
}
