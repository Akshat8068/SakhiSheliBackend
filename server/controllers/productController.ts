import { Request, Response } from "express"
import Product from "../models/productModel"

const getProducts = async (req: Request, res: Response): Promise<void> => {
    const products = await Product.find()
    if (!products) {
        res.status(404)
        throw new Error("No Products Found")
    } else {
        res.status(200).json(products)
    }
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
