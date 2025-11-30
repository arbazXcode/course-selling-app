import mongoose from "mongoose";

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const userSchema = new Schema({
    firstname: String,
    lastname: String,
    password: String,
    email: { type: String, unique: true }
})

const adminSchema = new Schema({
    firstname: String,
    lastname: String,
    password: String,
    email: { type: String, unique: true }
})

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId
})

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
}, { timestamps: true })

const userModel = mongoose.model("user", userSchema)
const adminModel = mongoose.model("admin", adminSchema)
const courseModel = mongoose.model("course", courseSchema)
const purchaseModel = mongoose.model("purchase", purchaseSchema)

export { userModel, adminModel, courseModel, purchaseModel }