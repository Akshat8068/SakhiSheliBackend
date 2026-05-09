import mongoose, { Document, Schema } from "mongoose"

export interface IReview extends Document {
    user: mongoose.Types.ObjectId
    product: mongoose.Types.ObjectId
    rating: number
    text: string
    isVerifedBuyer: boolean
}

const reviewSchema = new Schema<IReview>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, required: true },
        isVerifedBuyer: { type: Boolean, default: false },
    },
    { timestamps: true }
)

const Review = mongoose.model<IReview>("Review", reviewSchema)

export default Review
