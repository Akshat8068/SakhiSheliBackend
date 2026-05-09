import express from "express"
import protect from "../middleware/authMiddleware"
import { virtualTry } from "../controllers/virtualTryOnController"
import upload from "../middleware/fileUploadMiddleware"

const router = express.Router()

router.post("/", protect.forAuthUsers, upload.single("person_url"), virtualTry)

export default router
