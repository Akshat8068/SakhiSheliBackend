import express from "express"
import adminController from "../controllers/adminController"
import protect from "../middleware/authMiddleware"
import productUploadFields from "../middleware/dynamicFileUploadMiddleware"

const router = express.Router()

// Get All users
router.get("/users", protect.forAdmin, adminController.getAllUsers)
router.put("/users/:uid", protect.forAdmin, adminController.updateUser)

// Add all products
router.post("/product/add", protect.forAdmin, productUploadFields, adminController.addProducts)
router.put("/product/:pid", protect.forAdmin, productUploadFields, adminController.updateProducts)
router.get("/product/:pid", protect.forAdmin, adminController.getAdminProduct)

// Order Routes
router.put("/order/:oid", protect.forAdmin, adminController.updateOrder)
router.get("/orders", protect.forAdmin, adminController.getAllOrders)
router.get("/orders/:oid", protect.forAdmin, adminController.getSingleOrder)

// review
router.get("/reviews", protect.forAdmin, adminController.getAllReview)

// Coupon routes
router.get("/coupon", protect.forAdmin, adminController.allCoupon)
router.post("/coupon/add", protect.forAdmin, adminController.createCoupon)

export default router
