import express from "express"
import couponController from "../controllers/couponController"

const router = express.Router()

router.post("/", couponController.applyCoupon)

export default router
