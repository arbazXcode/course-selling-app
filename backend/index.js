import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"

import userRouter from "./routes/user.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/admin", adminRouter)

async function main() {
    await mongoose.connect("MONGO_URI=mongodb+srv://arbazdemo:arbaz123@cluster0.wgw5p.mongodb.net/course-selling-app");
    app.listen(3000, () => {
        console.log("db connected");
    })
}
main()