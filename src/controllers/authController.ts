import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

// פונקציה לעטיפת יצירת הקוקי לפי הסביבה
const setAuthCookie = (res: Response, token: string) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // HTTPS בפרודקשן
    sameSite: isProd ? "strict" : "none", // בפיתוח חייב none
    maxAge: 3600000,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

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

    const token = generateToken(user);

    const userInfo = { username: user.username, email: user.email };
    const encodedUser = Buffer.from(JSON.stringify(userInfo)).toString(
      "base64"
    );

    // קוקי עם הטוקן
    setAuthCookie(res, token);

    // קוקי נוסף עם userInfo לקריאה בצד הלקוח
    res.cookie("userInfo", encodedUser, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 3600000,
    });

    res.json({
      message: "Logged in successfully",
      userInfo,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
