import Fastify from "fastify"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import compress from "@fastify/compress"

export const buildApp = async () => {
  const app = Fastify({
    logger: true
  })

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() }
  })

  // Headers de seguridad (XSS, HSTS, etc.).
  await app.register(helmet)

  await app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })

  // Comprime respuestas con gzip.
  await app.register(compress)

  return app
}
