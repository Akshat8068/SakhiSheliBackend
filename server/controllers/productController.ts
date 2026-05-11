import { Request, Response } from "express"
import Product from "../models/productModel"

const getProducts = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
        Product.find({ isActive: true }).skip(skip).limit(limit),
        Product.countDocuments({ isActive: true }),
    ])

    res.status(200).json({
        products,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
    })
}

const getProduct = async (req: Request, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.pid)
    if (!product) {
        res.status(404)
        throw new Error("No Product Found")
    } else {
        res.status(200).json(product)
    }
}

const productController = { getProduct, getProducts }

export default productController
