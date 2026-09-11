import { Router } from 'express'
import healthRoutes from './health.routes'

const router = Router()

// Feature routers (auth, products, cart... get added here later)
router.use('/health', healthRoutes)

export default router
