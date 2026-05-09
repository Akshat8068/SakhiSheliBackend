import express from "express"
import reviewController from "../controllers/reviewController"
import protect from "../middleware/authMiddleware"

const router = express.Router()

router.get("/", reviewController.getAllReviews)
router.get("/:rid", reviewController.getReview)
router.post("/", protect.forAuthUsers, reviewController.addReview)

export default router
