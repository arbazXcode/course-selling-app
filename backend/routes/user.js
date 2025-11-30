import express from "express"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel, courseModel, purchaseModel } from "../db.js";
import authMiddleware from "../middleware/auth.middleware.js"

const userRouter = express.Router()


userRouter.post("/register", async (req, res) => {
    const { email, password, firstname, lastname } = req.body;

    try {
        // 1. Check missing fields
        if (!email || !password || !firstname) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // 2. Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create new user
        const newUser = await userModel.create({
            firstname,
            lastname: lastname || "",
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Registration successful.",
            userId: newUser._id
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});


userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email & password required." });
        }

        // 2. Check user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        // 4. Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,        // true in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ message: "Login successful.", token });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});


router.post("/logout", (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true
        });
        return res.json({ message: "Logged out successfully." });
    } catch {
        return res.status(500).json({ message: "Failed to logout." });
    }
});


router.get("/purchases", authMiddleware, async function (req, res) {
    try {
        const userId = req.user.userId
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }
        //find all the courses
        const purchases = await purchaseModel.find({ userId: userId })

        // check if he has purchased any course or not ? 
        if (!purchases || purchases.length === 0) {
            return res.status(401).json({
                success: false,
                message: "No courses purchased yet."
            })
        }

        //get course details for each course
        const courseIds = purchases.map((purchase) => purchase.courseId)
        const courses = await courseModel.find({
            _id: { $in: courseIds }
        })

        const courseMap = {}
        courses.forEach(course => {
            courseMap[course._id] = course
        })

        //combine purchases infor with course details
        const purchaseDetails = purchases.map(purchase => {
            const course = courseMap[purchase.courseId]
            return {
                purchaseId: purchase._id,
                purchaseDate: purchase.createdAt,
                course: {
                    id: course._id,
                    title: course.title,
                    description: course.description,
                    price: course.price,
                    imageUrl: course.imageUrl,
                    creatorId: course.creatorId
                }
            }
        })
        return res.status(200).json({
            success: true,
            message: "Purchases retrieved successfully",
            count: purchases.length,
            purchases: purchaseDetails
        })

    } catch (error) {
        console.error("Error fetching purchases:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
})

export default userRouter