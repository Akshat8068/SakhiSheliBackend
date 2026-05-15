import mongoose, { Document, Schema } from "mongoose"

export interface ICoupon extends Document {
    couponCode: string
    couponDiscount: number
    isActive: boolean

    usedBy?: mongoose.Types.ObjectId
    usedAt?: Date

    order?: mongoose.Types.ObjectId

    originalAmount?: number
    discountAmount?: number
    finalAmount?: number
}

const couponSchema = new Schema<ICoupon>(
    {
        couponCode: {
            type: String,
            unique: true,
            required: [true, "Please Type Coupon"],
        },

        couponDiscount: {
            type: Number,
            required: [true, "Please enter % Coupan Discount"],
        },

        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },

        // tracking

        usedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        usedAt: {
            type: Date,
        },

        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },

        originalAmount: Number,
        discountAmount: Number,
        finalAmount: Number,
    },
    { timestamps: true }
)

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema)

export default Coupon