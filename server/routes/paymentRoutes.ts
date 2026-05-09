import express from "express"
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController"
import protect from "../middleware/authMiddleware"

const router = express.Router()

router.post("/create-order", protect.forAuthUsers, createPaymentOrder)
router.post("/verify", protect.forAuthUsers, verifyPayment)

export default router
