import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { IUser } from "../models/User";

const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

// Explicit return type for all controller functions
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Registration failed" });
  }
};



export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // יוצר את ה-token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    // מוסיף מידע נוסף בקוקי (למשל שם המשתמש)
    const userInfo = { username: user.username, email: user.email };
    const encodedUser = Buffer.from(JSON.stringify(userInfo)).toString("base64");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.cookie("userInfo", encodedUser, {
      httpOnly: false, // כדי שתוכל לגשת אליו ב-client
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.json({ message: "Logged in successfully" });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
export const logout = (req: Request, res: Response): void => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
