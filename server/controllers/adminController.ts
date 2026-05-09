import { Request, Response } from "express"
import fs from "node:fs"
import User from "../models/userModel"
import Order from "../models/orderModel"
import Review from "../models/reviewModel"
import Product from "../models/productModel"
import Coupon from "../models/couponModel"
import uploaderToCloudinary from "../middleware/cloudinaryMiddleware"

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const users = await User.find()
    if (!users) {
        res.status(200)
        throw new Error("No users Found")
    } else {
        res.status(200).json(users)
    }
}

const updateUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.uid
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true })
    if (!updatedUser) {
        res.status(409)
        throw new Error("User Not Updated")
    }
    res.status(201).json(updatedUser)
}

const getAdminProduct = async (req: Request, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.pid)
    if (!product) {
        res.status(404)
        throw new Error("No Product Found")
    } else {
        res.status(200).json(product)
    }
}

const addProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, brand, originalPrice, salePrice } = req.body
        const categories = req.body.categories ? JSON.parse(req.body.categories) : null
        const colors = req.body.colors ? JSON.parse(req.body.colors) : null

        if (!name || !description || !brand || !categories || !originalPrice || !salePrice || !colors) {
            res.status(409).json({
                message: "Please fill all details including colors!",
            })
            return
        }

        const processedColors = []
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i]

            let mainImagePath = ""
            if ((req.files as any)?.[`mainImage_${i}`]?.[0]) {
                const uploadResult = await uploaderToCloudinary((req.files as any)[`mainImage_${i}`][0].path)
                mainImagePath = uploadResult.secure_url
                if (fs.existsSync((req.files as any)[`mainImage_${i}`][0].path)) {
                    fs.unlinkSync((req.files as any)[`mainImage_${i}`][0].path)
                }
            }

            const imagesArray = []
            if ((req.files as any)?.[`images_${i}`]) {
                for (let img of (req.files as any)[`images_${i}`]) {
                    const uploadResult = await uploaderToCloudinary(img.path)
                    imagesArray.push(uploadResult.secure_url)
                    if (fs.existsSync(img.path)) {
                        fs.unlinkSync(img.path)
                    }
                }
            }

            processedColors.push({
                colorName: color.colorName,
                mainImage: mainImagePath,
                images: imagesArray,
                sizes: color.sizes,
            })
        }

        const product = await Product.create({
            name,
            description,
            brand,
            categories,
            originalPrice: Number(originalPrice),
            salePrice: Number(salePrice),
            colors: processedColors,
        })

        res.status(201).json(product)
    } catch (error: any) {
        if (req.files) {
            Object.values(req.files as any)
                .flat()
                .forEach((file: any) => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path)
                    }
                })
        }
        res.status(500).json({ message: "Product not created", error: error.message })
    }
}

const updateProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.pid)
        if (!product) {
            res.status(404).json({ message: "Product not found" })
            return
        }

        const { name, description, originalPrice, salePrice, brand } = req.body
        const categories = req.body.categories ? JSON.parse(req.body.categories) : null
        const colors = req.body.colors ? JSON.parse(req.body.colors) : null

        const updateData: any = {}
        if (name) updateData.name = name
        if (brand) updateData.brand = brand
        if (description) updateData.description = description
        if (categories) updateData.categories = categories
        if (originalPrice) updateData.originalPrice = Number(originalPrice)
        if (salePrice) updateData.salePrice = Number(salePrice)

        if (colors && colors.length > 0) {
            const processedColors = []
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i]
                const existingColor: any =
                    product.colors.find((c) => c.colorName === color.colorName) ||
                    product.colors[i] ||
                    {}
                let mainImagePath = existingColor.mainImage || ""
                if ((req.files as any)?.[`mainImage_${i}`]?.[0]) {
                    const uploadResult = await uploaderToCloudinary((req.files as any)[`mainImage_${i}`][0].path)
                    fs.unlinkSync((req.files as any)[`mainImage_${i}`][0].path)
                    mainImagePath = uploadResult.secure_url
                }

                let imagesArray = existingColor.images || []
                if ((req.files as any)?.[`images_${i}`]) {
                    imagesArray = []
                    for (let img of (req.files as any)[`images_${i}`]) {
                        const uploadResult = await uploaderToCloudinary(img.path)
                        fs.unlinkSync(img.path)
                        imagesArray.push(uploadResult.secure_url)
                    }
                }

                processedColors.push({
                    colorName: color.colorName,
                    mainImage: mainImagePath,
                    images: imagesArray,
                    sizes: color.sizes,
                    _id: (existingColor as any)._id,
                })
            }
            updateData.colors = processedColors
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, updateData, {
            new: true,
            runValidators: true,
        })

        if (!updatedProduct) {
            res.status(404).json({ message: "Product not updated" })
            return
        }

        res.status(200).json(updatedProduct)
    } catch (error: any) {
        if (req.files) {
            Object.values(req.files as any)
                .flat()
                .forEach((file: any) => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path)
                    }
                })
        }
        res.status(500).json({ message: "Product not updated", error: error.message })
    }
}

const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.oid
    const { status } = req.body
    const myOrder = await Order.findById(orderId).populate("products.product").populate("user")

    if (!myOrder) {
        res.status(404)
        throw new Error("Order Not Found")
    }

    const updateStock = async (productId: string, updatedStock: number) => {
        await Product.findByIdAndUpdate(productId, { stock: updatedStock })
    }

    let updatedOrder
    if (status === "dispatched") {
        myOrder.products.forEach((item: any) => {
            let productId = item.product._id
            let productStock = item.product.stock
            updateStock(productId, productStock - item.qty)
        })
        updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "dispatched" }, { new: true })
            .populate("products.product")
            .populate("coupon")
    } else if (status === "delivered") {
        updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "delivered" }, { new: true })
    } else {
        if (myOrder.status === "dispatched") {
            res.status(409)
            throw new Error("Order already Dispatched")
        } else {
            updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "cancelled" }, { new: true })
        }
    }

    if (!updatedOrder) {
        res.status(409)
        throw new Error("Order Can't Be cancelled")
    }

    res.status(200).json(updatedOrder)
}

const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await Order.find().populate("products.product").populate("user")
    if (!orders || orders.length === 0) {
        res.status(404)
        throw new Error("No Orders Found")
    } else {
        res.status(200).json(orders)
    }
}

const getSingleOrder = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.oid
    const myOrder = await Order.findById(orderId).populate("products").populate("user")
    if (!myOrder) {
        res.status(404)
        throw new Error("Order Not Found")
    }
    res.status(200).json(myOrder)
}

const getAllReview = async (req: Request, res: Response): Promise<void> => {
    const reviews = await Review.find().populate("product").populate("user")
    if (!reviews) {
        res.status(200)
        throw new Error("No Reviews Here")
    } else {
        res.status(200).json(reviews)
    }
}

const createCoupon = async (req: Request, res: Response): Promise<void> => {
    const { couponCode, couponDiscount } = req.body
    if (!couponCode) {
        res.status(409)
        throw new Error("Please Type Coupon")
    }
    const newCoupon = await Coupon.create({ couponCode: couponCode.toUpperCase(), couponDiscount })
    if (!newCoupon) {
        res.status(409)
        throw new Error("Coupon Not created")
    }
    res.status(201).json(newCoupon)
}

const allCoupon = async (req: Request, res: Response): Promise<void> => {
    const coupons = await Coupon.find()
    if (!coupons) {
        res.status(200)
        throw new Error("No Reviews Here")
    } else {
        res.status(200).json(coupons)
    }
}

const adminController = {
    getAllUsers,
    updateUser,
    getAdminProduct,
    addProducts,
    updateProducts,
    updateOrder,
    getAllOrders,
    getSingleOrder,
    getAllReview,
    createCoupon,
    allCoupon,
}

export default adminController
