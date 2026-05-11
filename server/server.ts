import express from "express"
import "colors"
import cors from "cors"
import connectDB from "./config/dbConfig"
import dotenv from "dotenv"

// Local Routes
import authRoutes from "./routes/authRoutes"
import orderRoutes from "./routes/orderRoutes"
import adminRoutes from "./routes/adminRoutes"
import productRoutes from "./routes/productRoutes"
import cartRoutes from "./routes/cartRoutes"
import couponRoutes from "./routes/couponRoutes"
import virtualTryOnRoutes from "./routes/virtualTryOnRoutes"
import paymentRoutes from "./routes/paymentRoutes"
import errorHandler from "./middleware/errorHandler"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// connectDB
connectDB()

// CORS
app.use(cors())

// Body Parsers
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ limit: "100mb", extended: true }))

app.get("/", (req, res) => {
    res.send("Hello LibasMitr Eskill")
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/coupon", couponRoutes)
app.use("/api/virtual_tryon", virtualTryOnRoutes)
app.use("/api/payment", paymentRoutes)

// Error Handler
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`.bgBlue.black)
})
