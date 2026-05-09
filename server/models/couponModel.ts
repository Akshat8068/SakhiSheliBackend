import mongoose, { Document, Schema } from "mongoose"

export interface ICoupon extends Document {
    couponCode: string
    couponDiscount: number
    isActive: boolean
}

const couponSchema = new Schema<ICoupon>(
    {
        couponCode: { type: String, unique: true, required: [true, "Please Type Coupon"] },
        couponDiscount: { type: Number, required: [true, "Please enter % Coupan Discount"] },
        isActive: { type: Boolean, required: true, default: true },
    },
    { timestamps: true }
)

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema)

export default Coupon
