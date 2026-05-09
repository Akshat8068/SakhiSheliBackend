import { Request, Response } from "express"
import crypto from "crypto"
import razorpay from "../config/razorpayConfig"
import Order from "../models/orderModel"

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount } = req.body

        if (!amount) {
            res.status(400).json({ success: false, message: "Amount is required" })
            return
        }

        const options = {
            amount: amount * 100, // paise mein
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        }

        const order = await razorpay.orders.create(options)

        res.status(200).json({ success: true, order })
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment order creation failed" })
    }
}

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

        const sign = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET!)
            .update(sign.toString())
            .digest("hex")

        const isAuthentic = expectedSign === razorpay_signature

        if (!isAuthentic) {
            res.status(400).json({ success: false, message: "Invalid Signature" })
            return
        }

        // Update order status to dispatched after payment
        if (orderId) {
            await Order.findByIdAndUpdate(orderId, { status: "placed" }, { new: true })
        }

        res.status(200).json({ success: true, message: "Payment Verified" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment Verification Failed" })
    }
}
