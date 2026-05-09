import multer from "multer"
import crypto from "crypto"
import path from "path"
import fs from "fs"

const uploadDir = "uploads/"
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, `person-${crypto.randomUUID()}${ext}`)
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
})

export default upload
