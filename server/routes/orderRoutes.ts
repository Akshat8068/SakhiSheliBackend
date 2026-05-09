import express from "express"
import orderController from "../controllers/orderController"
import protect from "../middleware/authMiddleware"

const router = express.Router()

router.get("/", protect.forAuthUsers, orderController.getOrders)
router.get("/:oid", protect.forAuthUsers, orderController.getOrder)
router.post("/", protect.forAuthUsers, orderController.placeOrder)
router.put("/:oid", protect.forAuthUsers, orderController.cancelOrder)

export default router
