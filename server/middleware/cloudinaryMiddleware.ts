import { v2 as cloudinary } from "cloudinary"
import fs from "node:fs"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name: "dl77ftllk",
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
})

const uploaderToCloudinary = async (fileLink: string): Promise<any> => {
    try {
        const uploadResult = await cloudinary.uploader.upload(fileLink, {
            resource_type: "auto",
        })
        return uploadResult
    } catch (error) {
        if (fs.existsSync(fileLink)) {
            fs.unlinkSync(fileLink)
        }
        throw error
    }
}

export default uploaderToCloudinary
