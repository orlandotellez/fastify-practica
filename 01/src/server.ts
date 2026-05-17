import { buildApp } from "./app"
import { env } from "./config/env"
import { closeRedis } from "./config/redis"
import { prisma } from "./config/prisma"
import { logger } from "./infrastructure/logger"

const startServer = async () => {
  try {
    const app = await buildApp()

    await app.listen({ port: env.PORT, host: env.HOST })

    logger.info(`Server listening on http://${env.HOST}:${env.PORT}`)

    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`)
      await app.close()
      await prisma.$disconnect()
      await closeRedis()
      process.exit(0)
    }

    process.on("SIGINT", () => gracefulShutdown("SIGINT"))
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
  } catch (error) {
    logger.error({ err: error }, "Failed to start server")
    process.exit(1)
  }
}

startServer()
