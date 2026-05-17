import Fastify from "fastify"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import compress from "@fastify/compress"
import rateLimit from "@fastify/rate-limit"
import { env } from "./config/env"
import { getRedisClient } from "./config/redis"

export const buildApp = async () => {
  const app = Fastify({
    logger: env.NODE_ENV === 'development'
      ? {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
      : {
        level: 'info',
      },
  })

  getRedisClient()

  // Headers de seguridad (XSS, HSTS, etc.).
  await app.register(helmet)

  await app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })

  // Comprime respuestas con gzip.
  await app.register(compress)

  // Limita a 100 requests/min por IP.
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  })

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() }
  })

  return app
}
