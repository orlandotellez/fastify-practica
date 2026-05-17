import { buildApp } from "./app"

const startServer = async () => {
  try {
    const app = await buildApp()

    await app.listen({ port: 3000, host: "0.0.0.0" })

  } catch (error) {
    process.exit(1)
  }
}

startServer()
