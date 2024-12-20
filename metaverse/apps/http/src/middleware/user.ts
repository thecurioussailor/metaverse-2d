import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if(!token){
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET || "secret") as { role: string, userId: string};
        req.userId = decoded.userId;
        next();
    }catch(e){
        res.status(401).json({
            message: "Unauthorized"
        })
    }
}