import { buildApp } from "./app"
import { logger } from "./infrastructure/logger"

const startServer = async () => {
  try {
    const app = await buildApp()

    const PORT = 3000
    const HOST = "0.0.0.0"

    await app.listen({ port: PORT, host: HOST })

    logger.info(`Server listening on http://${HOST}:${PORT}`)

    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`)
      await app.close()
      process.exit(0)
    }

    process.on("SIGINT", () => gracefulShutdown("SIGINT"))
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
  } catch (error) {
    process.exit(1)
  }
}

startServer()
