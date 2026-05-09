import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../models/userModel"

interface JwtPayload {
    id: string
}

const forAuthUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            const token = req.headers.authorization.split(" ")[1]
            const decode = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
            const user = await User.findById(decode.id).select("-password")
            req.user = user ?? undefined
            next()
        } else {
            res.status(400)
            throw new Error("Unauthorized Access : Valid Token Needed")
        }
    } catch (error) {
        res.status(400)
        throw new Error("Unauthorized Access")
    }
}

const forAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            const token = req.headers.authorization.split(" ")[1]
            const decode = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
            const user = await User.findById(decode.id).select("-password")
            if (user?.isAdmin) {
                req.user = user
                next()
            } else {
                res.status(400)
                throw new Error("Unauthorized Access : Admin access only")
            }
        } else {
            res.status(400)
            throw new Error("Unauthorized Access : Valid Token Needed")
        }
    } catch (error) {
        res.status(400)
        throw new Error("Unauthorized Access")
    }
}

const protect = { forAuthUsers, forAdmin }

export default protect
