"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ error: "לא אותרתה התחברות" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = (await User_1.default.findById(decoded.id).select("_id username"));
        if (!user) {
            res.status(401).json({ error: "משתמש לא נמצא" });
            return;
        }
        req.user = {
            _id: String(user._id),
            username: user.username,
        };
        next();
    }
    catch (err) {
        res.status(401).json({ error: "טוקן לא תקין" });
    }
};
exports.default = authMiddleware;
