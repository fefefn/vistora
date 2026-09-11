import express from 'express'
import type { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { connectDB } from './config/db'
import routes from './routes'
import { notFound } from './middleware/notFound'
import { errorHandler } from './middleware/errorHandler'

const app: Application = express()

/* ----------------------------- Core middleware ---------------------------- */
app.use(helmet())                                // secure HTTP headers
app.use(cors())                                  // allow the frontend to call this API
app.use(express.json())                          // parse JSON request bodies
app.use(express.urlencoded({ extended: true }))  // parse URL-encoded bodies
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))                         // concise request logging
}

/* --------------------------------- Routes --------------------------------- */
app.use('/api', routes)

/* ------------------------------- Fallbacks -------------------------------- */
app.use(notFound)       // unknown route -> 404
app.use(errorHandler)   // any thrown error -> 500 JSON

/* ------------------------------ Start server ------------------------------ */
const startServer = (): void => {
  app.listen(env.PORT, () => {
    console.log(`🚀 NexCart API running on http://localhost:${env.PORT}`)
    console.log(`   Health check:   http://localhost:${env.PORT}/api/health`)
    console.log(`   Environment:    ${env.NODE_ENV}`)
  })

  // Connect to the database in the background so the API is available immediately.
  void connectDB()
}

startServer()

export default app
