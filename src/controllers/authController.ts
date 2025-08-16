import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const isProd = process.env.NODE_ENV === "production";

const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // true בפרודקשן
    sameSite: isProd ? "none" : "lax", // none לפרודקשן cross-site, lax בפיתוח
    maxAge: 3600000,
    path: "/",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err: unknown) {
    if (isMongoError(err)) {
      const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
      return res.status(400).json({ error: `${field} already exists` });
    }

    const errorMessage =
      err instanceof Error ? err.message : "Registration failed";
    return res.status(500).json({ error: errorMessage });
  }
};

// Type guard for MongoDB errors
function isMongoError(
  err: unknown
): err is { code: number; keyValue: Record<string, unknown> } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as any).code === 11000
  );
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // בדיקת שדות חובה
    if (!email || !password) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Email and password are required",
      });
    }

    // חיפוש המשתמש
    const user = await User.findOne({ email });

    // אם המשתמש לא קיים
    if (!user) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // בדיקת סיסמה
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // יצירת טוקן
    const token = generateToken(user);

    // הכנת נתוני משתמש
    const userInfo = {
      username: user.username,
      email: user.email,
      id: user._id,
    };

    const encodedUser = Buffer.from(JSON.stringify(userInfo)).toString(
      "base64"
    );

    // הגדרת קוקי
    setAuthCookie(res, token);
    res.cookie("userInfo", encodedUser, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 3600000,
      path: "/",
    });

    res.json({
      message: "Logged in successfully",
      userInfo,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.clearCookie("userInfo", { path: "/" });
  res.json({ message: "Logged out successfully" });
};
