import { Request, Response } from "express"
import Order from "../models/orderModel"
import Review from "../models/reviewModel"

const getAllReviews = async (req: Request, res: Response): Promise<void> => {
    const productId = (req as any).product
    const reviews = await Review.find({ product: productId }).populate("user")

    if (!reviews) {
        res.status(200)
        throw new Error("No Products Found")
    } else {
        res.status(200).json(reviews)
    }
}

const getReview = async (req: Request, res: Response): Promise<void> => {
    const review = await Review.findById(req.params.rid)
    if (!review) {
        res.status(200)
        throw new Error("No Products Found")
    } else {
        res.status(200).json(review)
    }
}

const addReview = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id
    const productId = (req as any).product
    const { rating, text } = req.body

    if (!rating || !text) {
        res.status(404)
        throw new Error("Please Fill all details")
    }

    const orders = await Order.find({ user: userId }).populate("products.product")
    const orderHistory = orders.flatMap((order) => order.products || [])
    const productExist = orderHistory.filter((item) => {
        return (item.product as any).toString() === productId
    })

    const review = new Review({
        user: userId,
        product: productId,
        rating,
        text,
        isVerifedBuyer: productExist.length !== 0,
    })

    await review.save()
    await review.populate("user")
    await review.populate("product")

    if (!review) {
        res.status(409)
        throw new Error("Review Not Save")
    }

    res.status(201).json(review)
}

const reviewController = { getAllReviews, addReview, getReview }

export default reviewController
