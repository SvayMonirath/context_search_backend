import express from 'express';
import jwt from "jsonwebtoken";
export const verify_access_token = (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new Error("Invalid access token");
    }
};
//# sourceMappingURL=authentication.middleware.js.map