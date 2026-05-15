import { Request, Response } from "express"
import Coupon from "../models/couponModel"

const applyCoupon = async (req: Request, res: Response): Promise<void> => {
    const { couponCode } = req.body

    if (!couponCode) {
        res.status(409)
        throw new Error("Please Entre Coupon")
    }


    const coupon = await Coupon.findOne({ couponCode: couponCode })

    if (!coupon) {
        res.status(404)
        throw new Error("Invalid Coupon")
    }
    if (!coupon.isActive) {
        res.status(400)
        throw new Error("Coupon already used")
    }

    res.status(200).json(coupon)
}

const couponController = { applyCoupon }

export default couponController
