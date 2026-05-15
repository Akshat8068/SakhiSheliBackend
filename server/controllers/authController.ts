import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/userModel"

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "30d" })
}

const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone, address, isAdmin } = req.body

    if (!name || !email || !password || !phone || !address) {
        res.status(400).json({ success: false, message: "Please fill all details" })
        return
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] })
    if (existingUser) {
        res.status(409).json({ success: false, message: "User already exists" })
        return
    }

    if (phone.length !== 10) {
        res.status(400).json({ success: false, message: "Invalid phone number" })
        return
    }

    const salt = bcrypt.genSaltSync(10)
    const hashpassword = bcrypt.hashSync(password, salt)

    const user = await User.create({
        name,
        email,
        password: hashpassword,
        phone,
        address,
        isAdmin: isAdmin ?? false,
    })

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                credits: user.credits,
            },
            tokens: {
                accessToken: generateToken(user._id.toString()),
            },
        },
    })
}

const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400).json({ success: false, message: "Please fill all details" })
        return
    }

    const user = await User.findOne({ email })

    if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    isAdmin: user.isAdmin,
                    credits: user.credits,
                },
                tokens: {
                    accessToken: generateToken(user._id.toString()),
                },
            },
        })
        return
    }

    res.status(401).json({ success: false, message: "Invalid credentials" })
}
const updateUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id

    const { name, email, phone, address, password } = req.body

    const user = await User.findById(userId)

    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found",
        })
        return
    }

    // check email uniqueness
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email })

        if (existingEmail) {
            res.status(409).json({
                success: false,
                message: "Email already exists",
            })
            return
        }

        user.email = email
    }

    // check phone uniqueness
    if (phone && phone !== user.phone) {
        if (phone.length !== 10) {
            res.status(400).json({
                success: false,
                message: "Invalid phone number",
            })
            return
        }

        const existingPhone = await User.findOne({ phone })

        if (existingPhone) {
            res.status(409).json({
                success: false,
                message: "Phone already exists",
            })
            return
        }

        user.phone = phone
    }

    // update other fields
    if (name) user.name = name
    if (address) user.address = address

    // password update
    if (password) {
        const salt = bcrypt.genSaltSync(10)
        user.password = bcrypt.hashSync(password, salt)
    }

    await user.save()

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                credits: user.credits,
                isAdmin: user.isAdmin,
            },
        },
    })
}

const authController = { loginUser, registerUser, updateUser }

export default authController
