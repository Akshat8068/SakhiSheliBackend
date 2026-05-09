import express, { Request, Response, NextFunction } from "express"
import productController from "../controllers/productController"
import reviewRoutes from "./reviewRoutes"

const router = express.Router({ mergeParams: true })

router.get("/", productController.getProducts)
router.get("/:pid", productController.getProduct)

// Middleware to attach product id to req
const addProduct = (req: Request, res: Response, next: NextFunction): void => {
    ; (req as any).product = req.params.pid
    next()
}

router.use("/:pid/review", addProduct, reviewRoutes)

export default router
