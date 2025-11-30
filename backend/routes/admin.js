import express from "express"

const adminRouter = express.Router()

adminRouter.post("/signup", function (req, res) { })

adminRouter.post("/signin", function (req, res) { })

adminRouter.post("/", function (req, res) { })

adminRouter.put("/", function (req, res) { })

adminRouter.get("/bulk", function (req, res) { })

export default adminRouter