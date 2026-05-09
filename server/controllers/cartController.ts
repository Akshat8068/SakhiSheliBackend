import { Request, Response } from "express"
import Cart from "../models/cartModel"
import Product from "../models/productModel"

const getCart = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id

    const cart = await Cart.findOne({ user: userId }).populate("products.product")

    if (!cart) {
        res.status(200).json({ products: [] })
        return
    }

    res.status(200).json(cart)
}

const addCart = async (req: Request, res: Response): Promise<void> => {
    const { productId, colorName, size, qty = 1 } = req.body
    const userId = req.user?._id

    if (!productId || !colorName || !size) {
        res.status(400)
        throw new Error("Product ID, color, and size are required")
    }

    const product = await Product.findById(productId)
    if (!product) {
        res.status(404)
        throw new Error("Product Not Found!")
    }

    const selectedColor = product.colors.find((c) => c.colorName === colorName)
    if (!selectedColor) {
        res.status(400)
        throw new Error("Selected color not found")
    }

    const selectedSize = selectedColor.sizes.find((s) => s.size === size)
    if (!selectedSize) {
        res.status(400)
        throw new Error("Selected size not found")
    }

    if (selectedSize.stock < qty) {
        res.status(400)
        throw new Error(`Insufficient stock. Only ${selectedSize.stock} available`)
    }

    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
        cart = new Cart({
            user: userId,
            products: [
                {
                    product: productId,
                    colorName: colorName,
                    colorMainImage: selectedColor.mainImage,
                    size: size,
                    qty: qty,
                },
            ],
        })
    } else {
        const productIndex = cart.products.findIndex(
            (item) =>
                item.product.toString() === productId && item.colorName === colorName && item.size === size
        )

        if (productIndex > -1) {
            const newQty = cart.products[productIndex].qty + parseInt(qty)

            if (newQty > selectedSize.stock) {
                res.status(400)
                throw new Error(`Cannot add more. Only ${selectedSize.stock} available`)
            }

            cart.products[productIndex].qty = newQty
        } else {
            cart.products.push({
                product: productId,
                colorName: colorName,
                colorMainImage: selectedColor.mainImage,
                size: size,
                qty: qty,
            } as any)
        }
    }

    await cart.save()
    await cart.populate("products.product")

    res.status(200).json(cart)
}

const updateCart = async (req: Request, res: Response): Promise<void> => {
    const { productId, colorName, size, qty } = req.body
    const userId = req.user?._id

    if (qty < 1) {
        res.status(400)
        throw new Error("Quantity must be at least 1")
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
        res.status(404)
        throw new Error("Cart not found")
    }

    const productIndex = cart.products.findIndex(
        (item) =>
            item.product.toString() === productId && item.colorName === colorName && item.size === size
    )

    if (productIndex === -1) {
        res.status(404)
        throw new Error("Product variant not found in cart")
    }

    const product = await Product.findById(productId)
    if (!product) {
        res.status(404)
        throw new Error("Product not found")
    }

    const selectedColor = product.colors.find((c) => c.colorName === colorName)
    const selectedSize = selectedColor?.sizes.find((s) => s.size === size)

    if (!selectedSize || qty > selectedSize.stock) {
        res.status(400)
        throw new Error(`Quantity exceeds available stock (${selectedSize?.stock || 0})`)
    }

    cart.products[productIndex].qty = qty
    await cart.save()
    await cart.populate("products.product")

    res.status(200).json(cart)
}

const removeCart = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params
    const { colorName, size } = req.query
    const userId = req.user?._id

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
        res.status(404)
        throw new Error("Cart not found")
    }

    cart.products = cart.products.filter(
        (item) =>
            !(
                item.product.toString() === productId &&
                item.colorName === colorName &&
                item.size === size
            )
    )

    await cart.save()
    await cart.populate("products.product")

    res.status(200).json(cart)
}

const clearCart = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
        res.status(404)
        throw new Error("Cart Not Found!")
    }

    cart.products = []
    await cart.save()

    res.status(200).json(cart)
}

const cartController = { getCart, addCart, updateCart, removeCart, clearCart }

export default cartController
