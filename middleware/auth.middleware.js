import jwt from "jsonwebtoken"
const authMiddleware = async (req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.token)
            token = req.cookies.token

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied." });
        }

        //verify the token
        const decode = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decode
        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

export default authMiddleware