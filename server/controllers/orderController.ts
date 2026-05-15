import { Request, Response } from "express"
import Cart from "../models/cartModel"
import Coupon from "../models/couponModel"
import Order from "../models/orderModel"

const placeOrder = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id

    const { shippingAddress, selectedProducts, coupon } = req.body

    if (!shippingAddress) {
        res.status(400)
        throw new Error("Please Enter Shipping Address")
    }

    if (!selectedProducts || selectedProducts.length === 0) {
        res.status(400)
        throw new Error("Please select products")
    }

    const cart = await Cart.findOne({ user: userId }).populate("products.product")

    if (!cart) {
        res.status(404)
        throw new Error("Cart not found")
    }

    // selected cart items
    const cartProducts = cart.products.filter((item) =>
        selectedProducts.some(
            (p: any) =>
                p.productId === item.product.toString() &&
                p.colorName === item.colorName &&
                p.size === item.size
        )
    )

    if (cartProducts.length === 0) {
        res.status(400)
        throw new Error("Selected products not found in cart")
    }

    // coupon
    const couponCode = coupon
        ? await Coupon.findOne({ couponCode: coupon })
        : null

    // total bill
    let totalBill = cartProducts.reduce((acc, item) => {
        const product = item.product as any
        return acc + product.salePrice * item.qty
    }, 0)

    // store original amount before discount
    const originalAmount = totalBill

    // apply discount
    const discountAmount = couponCode
        ? (totalBill * couponCode.couponDiscount) / 100
        : 0

    totalBill = couponCode ? totalBill - discountAmount : totalBill

    // order products
    const orderProducts = cartProducts.map((item) => ({
        product: (item.product as any)._id,
        colorName: item.colorName,
        colorMainImage: item.colorMainImage,
        size: item.size,
        qty: item.qty,
    }))

    // create order
    const order = await Order.create({
        user: userId,
        products: orderProducts,
        TotalBillAmount: totalBill,
        isDiscounted: couponCode ? true : false,
        coupon: couponCode ? couponCode._id : null,
        shippingAddress,
    })

    // update coupon after order is placed
    if (couponCode) {
        couponCode.usedBy = userId
        couponCode.usedAt = new Date()

        couponCode.order = order._id

        couponCode.originalAmount = originalAmount
        couponCode.discountAmount = discountAmount
        couponCode.finalAmount = totalBill

        couponCode.isActive = false

        await couponCode.save()
    }

    // remove ordered products from cart
    cart.products = cart.products.filter(
        (item) =>
            !selectedProducts.some(
                (p: any) =>
                    p.productId === item.product.toString() &&
                    p.colorName === item.colorName &&
                    p.size === item.size
            )
    )

    await cart.save()

    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order,
    })
}

const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.oid
    const myOrder = await Order.findById(orderId).populate("products.product").populate("user")

    if (!myOrder) {
        res.status(404)
        throw new Error("Order Not Found")
    }

    if (myOrder.status === "placed") {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "cancelled" }, { new: true })
        if (!updatedOrder) {
            res.status(409)
            throw new Error("Order Can't Be cancelled")
        }
        res.status(200).json({ message: "Order Cancelled", updatedOrder })
    } else {
        res.status(409)
        throw new Error("Order Can't Be cancelled")
    }
}

const getOrders = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id
    const myOrders = await Order.find({ user: userId }).populate("products.product").populate("user")

    if (!myOrders) {
        res.status(404)
        throw new Error("Orders Not Found")
    }

    res.status(200).json(myOrders)
}

const getOrder = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.oid
    const myOrder = await Order.findById(orderId).populate("products.product").populate("user")

    if (!myOrder) {
        res.status(404)
        throw new Error("Order Not Found")
    }

    res.status(200).json({ myOrder })
}

const orderController = { placeOrder, cancelOrder, getOrders, getOrder }

export default orderController
