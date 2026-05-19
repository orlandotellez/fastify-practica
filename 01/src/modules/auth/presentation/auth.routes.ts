import type { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";
import { authGuard } from "@/core/guard/auth.guard";

export const authRoutes = async (fastify: FastifyInstance, _options: any) => {
  // esto es para proteger todas las rutas
  // fastify.addHook("preHandler", authGuard)

  fastify.post("/register", authController.register)
  fastify.post("/login", authController.login)
  fastify.post("/logout", {
    preHandler: authGuard
  }, authController.logout)
}
