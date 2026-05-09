import multer, { FileFilterCallback } from "multer"
import crypto from "crypto"
import path from "path"
import fs from "fs"
import { Request } from "express"

// Ensure uploads directory exists
const uploadDir = "uploads/"
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => cb(null, uploadDir),
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, `product-${crypto.randomUUID()}${ext}`)
    },
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
        cb(null, true)
    } else {
        cb(new Error("Only image files are allowed!"))
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
})

// Generate fields for MAX_COLORS colors
const fields: multer.Field[] = []
const MAX_COLORS = 20

for (let i = 0; i < MAX_COLORS; i++) {
    fields.push({ name: `mainImage_${i}`, maxCount: 1 })
    fields.push({ name: `images_${i}`, maxCount: 20 })
}

export const productUploadFields = upload.fields(fields)

export default productUploadFields
