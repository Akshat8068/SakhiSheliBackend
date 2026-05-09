import mongoose, { Document, Schema } from "mongoose"

interface ISize {
    size: "S" | "M" | "L" | "XL" | "2XL" | "3XL"
    stock: number
}

interface IColor {
    colorName: string
    mainImage: string
    images: string[]
    sizes: ISize[]
}

export interface IProduct extends Document {
    name: string
    description: string
    categories: string[]
    brand: string
    originalPrice: number
    salePrice: number
    colors: IColor[]
    isActive: boolean
}

const sizeSchema = new Schema<ISize>(
    {
        size: { type: String, enum: ["S", "M", "L", "XL", "2XL", "3XL"], required: true },
        stock: { type: Number, required: true, default: 0 },
    },
    { _id: false }
)

const colorSchema = new Schema<IColor>(
    {
        colorName: { type: String, required: true },
        mainImage: { type: String, default: "" },
        images: [{ type: String }],
        sizes: [sizeSchema],
    },
    { _id: false }
)

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        categories: [{ type: String, required: true }],
        brand: { type: String, required: true },
        originalPrice: { type: Number, required: true },
        salePrice: { type: Number, required: true },
        colors: [colorSchema],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

const Product = mongoose.model<IProduct>("Product", productSchema)

export default Product
