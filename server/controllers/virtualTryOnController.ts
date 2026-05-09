import { Request, Response } from "express"
import fs from "node:fs"
import Replicate from "replicate"
import User from "../models/userModel"
import uploadToCloudinary from "../middleware/cloudinaryMiddleware"

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN as string,
})

export const virtualTry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cloth_url, garment_des } = req.body

        if (!cloth_url || !garment_des) {
            res.status(409)
            throw new Error("Please Enter All Details!")
        }

        const imagePath = await uploadToCloudinary((req.file as Express.Multer.File).path)
        fs.unlinkSync((req.file as Express.Multer.File).path)

        const user = await User.findById(req.user?._id)

        if (!user || user.credits <= 0) {
            res.status(409)
            throw new Error("Not Enough Credits")
        }

        const input = {
            garm_img: cloth_url,
            human_img: imagePath.secure_url,
            garment_des: garment_des,
        }

        const output = await replicate.run(
            "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
            { input }
        ) as any

        await User.findByIdAndUpdate(user._id, { credits: user.credits - 1 }, { new: true })

        res.json({
            success: true,
            credits: user.credits,
            output_url: output.url(),
        })
    } catch (error: any) {
        res.status(409)
        console.log(error.message)
        throw new Error("Currently Virtual Try Is Not Available")
    }
}
