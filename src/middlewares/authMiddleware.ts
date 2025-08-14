import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; // נייבא גם את IUser

interface AuthRequest extends Request {
  user?: {
    _id: string;
    username: string;
  };
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ error: "לא אותרתה התחברות" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const user = (await User.findById(decoded.id).select(
      "_id username"
    )) as IUser | null;

    if (!user) {
      res.status(401).json({ error: "משתמש לא נמצא" });
      return;
    }

   req.user = {
     _id: String(user._id), 
     username: user.username as string,
   };


    next();
  } catch (err) {
    res.status(401).json({ error: "טוקן לא תקין" });
  }
};

export default authMiddleware;
