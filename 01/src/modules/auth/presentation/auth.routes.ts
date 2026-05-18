import type { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";

export const authRoutes = async (fastify: FastifyInstance, _options: any) => {
  fastify.post("/register", authController.register)
  fastify.post("/login", authController.login)
  fastify.post("/logout", authController.logout)
}
