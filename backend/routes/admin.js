import express from "express"
import { adminModel } from "../db.js"
import bcrypt from "bcrypt"

const adminRouter = express.Router()

adminRouter.post("/signup", async function (req, res) {
    try {
        const { firstname, lastname, email, password } = req.body

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials."
            })
        }
        //check if admin exists or not? 
        const adminExists = await adminModel.findOne({ email })
        if (adminExists) {
            return res.status(401).send({
                success: false,
                message: "admin alread exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        //create the admin
        const newAdmin = await adminModel.create({
            firstname,
            lastname: lastname || "",
            email,
            password: hashedPassword
        })

        res.status(201).json({
            success: true,
            message: "admin created successfully",
            adminId: newAdmin._id
        })
    } catch (error) {
        console.error("Admin signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
})

// Admin Signin
adminRouter.post("/signin", async function (req, res) {
    try {
        const { email, password } = req.body;

        // 1. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find admin
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // 3. Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // 4. Create JWT token (with admin role)
        const token = jwt.sign(
            {
                userId: admin._id,
                email: admin.email,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: "Admin login successful",
            token: token
        });

    } catch (error) {
        console.error("Admin signin error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
})
adminRouter.post("/", function (req, res) { })

adminRouter.put("/", function (req, res) { })

adminRouter.get("/bulk", function (req, res) { })

export default adminRouter