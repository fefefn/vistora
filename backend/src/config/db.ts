import mongoose from 'mongoose'
import { env } from './env'

/**
 * Connects to MongoDB via Mongoose.
 * If MONGODB_URI is missing or unreachable it logs a warning but does NOT crash,
 * so the API (and the health route) stay available during early development.
 */
export const connectDB = async (): Promise<void> => {
  if (!env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set — starting API without a database connection.')
    return
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection failed:', (error as Error).message)
    console.error('   API will keep running; set a valid MONGODB_URI to enable the database.')
  }
}
