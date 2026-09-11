import dotenv from 'dotenv'

// Load variables from .env into process.env
dotenv.config()

/** Single, typed source of truth for environment configuration. */
export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
}
