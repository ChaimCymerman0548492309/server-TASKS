"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const isProd = process.env.NODE_ENV === "production";
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};
const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProd, // true בפרודקשן
        sameSite: isProd ? "none" : "lax", // none לפרודקשן cross-site, lax בפיתוח
        maxAge: 3600000,
        path: "/",
    });
};
const register = async (req, res) => {
    try {
        const user = new User_1.default(req.body);
        await user.save();
        const token = generateToken(user);
        setAuthCookie(res, token);
        return res.status(201).json({ message: "Registered successfully" });
    }
    catch (err) {
        if (isMongoError(err)) {
            const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
            return res.status(400).json({ error: `${field} already exists` });
        }
        const errorMessage = err instanceof Error ? err.message : "Registration failed";
        return res.status(500).json({ error: errorMessage });
    }
};
exports.register = register;
// Type guard for MongoDB errors
function isMongoError(err) {
    return (typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === 11000);
}
const login = async (req, res) => {
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
        const user = await User_1.default.findOne({ email });
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
        const encodedUser = Buffer.from(JSON.stringify(userInfo)).toString("base64");
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
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            error: "SERVER_ERROR",
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie("token", { path: "/" });
    res.clearCookie("userInfo", { path: "/" });
    res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
