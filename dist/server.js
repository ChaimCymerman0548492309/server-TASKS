"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const db_1 = __importDefault(require("./config/db"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// === Environment detection ===
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = isProd
    ? [
        "https://tasks-clint.netlify.app",
        "https://tasks-server.com",
        "https://tasks-server-production.up.railway.app",
    ]
    : ["http://localhost:5173"];
// ✅ CORS for HTTP requests
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// === Health check routes ===
app.get("/api/is-alive", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is alive" });
});
let activeSockets = new Set();
app.get("/api/socket-status", (req, res) => {
    res.status(200).json({
        status: "ok",
        activeConnections: activeSockets.size,
    });
});
// === Socket.IO with CORS ===
exports.io = new socket_io_1.Server(server, {
    path: "/api/socket.io",
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    },
});
exports.io.on("connection", (socket) => {
    const origin = socket.handshake.headers.origin;
    console.log(`Socket.IO connected from origin: ${origin}`);
    activeSockets.add(socket.id);
    socket.on("disconnect", () => {
        console.log(`Socket.IO disconnected from origin: ${origin}`);
        activeSockets.delete(socket.id);
    });
});
// === Main API routes ===
app.use("/api/auth", authRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
const PORT = process.env.PORT || 5000;
(0, db_1.default)().then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
