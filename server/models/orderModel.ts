import mongoose, { Document, Schema } from "mongoose"

interface IOrderProduct {
    product: mongoose.Types.ObjectId
    colorName: string
    colorMainImage: string
    size: "S" | "M" | "L" | "XL" | "2XL" | "3XL"
    qty: number
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId
    products: IOrderProduct[]
    TotalBillAmount: number
    isDiscounted: boolean
    coupon?: mongoose.Types.ObjectId
    status: "placed" | "dispatched" | "cancelled" | "delivered"
    shippingAddress: string
}

const orderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        products: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                colorName: { type: String, required: true },
                colorMainImage: { type: String, required: true },
                size: {
                    type: String,
                    required: true,
                    enum: ["S", "M", "L", "XL", "2XL", "3XL"],
                },
                qty: { type: Number, required: true, min: [1, "Quantity cannot be less than 1"], default: 1 },
                _id: false,
            },
        ],
        TotalBillAmount: { type: Number, required: true },
        isDiscounted: { type: Boolean, required: true },
        coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },
        status: {
            type: String,
            enum: ["placed", "dispatched", "cancelled", "delivered"],
            default: "placed",
            required: true,
        },
        shippingAddress: { type: String, required: [true, "Please Enter Shipping Address"] },
    },
    { timestamps: true }
)

const Order = mongoose.model<IOrder>("Order", orderSchema)

export default Order
