import express  from 'express';
import jwt from "jsonwebtoken";


export const verify_access_token = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.cookies.access_token;
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    throw new Error("Invalid access token");
  }
}
