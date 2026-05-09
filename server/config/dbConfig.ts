import mongoose from "mongoose"

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string)
        console.log(`DB connection name ${conn.connection.name}`.bgGreen)
    } catch (error: any) {
        console.log(`DB Connection Failed ${error.message}`)
    }
}

export default connectDB
