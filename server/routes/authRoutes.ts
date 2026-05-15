import express from "express"
import authController from "../controllers/authController"
import protect from "../middleware/authMiddleware"

const router = express.Router()

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.put("/update", protect.forAuthUsers, authController.updateUser)

export default router
