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
const logger_1 = require("./config/logger");
// --- Express + Socket.IO setup ---
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = isProd
    ? [
        "https://tasks-clint.netlify.app",
        "https://tasks-server.com",
        "https://tasks-server-production.up.railway.app",
    ]
    : ["http://localhost:5173"];
app.use((0, cors_1.default)({ origin: allowedOrigins, credentials: true }));
// === Health check ===
app.get("/api/is-alive", (req, res) => {
    logger_1.logger.info("Server", { service: "Server", info: "Health check requested" });
    res.status(200).json({ status: "ok", message: "Server is alive" });
});
// === Socket status ===
let activeSockets = new Set();
app.get("/api/socket-status", (req, res) => {
    logger_1.logger.debug("Server", {
        service: "Server",
        activeSockets: activeSockets.size,
    });
    res.status(200).json({ status: "ok", activeConnections: activeSockets.size });
});
// === Socket.IO ===
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
    logger_1.logger.info("Socket.IO", {
        service: "Socket.IO",
        message: `Connected from origin: ${origin}`,
        socketId: socket.id,
    });
    activeSockets.add(socket.id);
    socket.on("disconnect", () => {
        logger_1.logger.warn("Socket.IO", {
            service: "Socket.IO",
            message: `Disconnected from origin: ${origin}`,
            socketId: socket.id,
        });
        activeSockets.delete(socket.id);
    });
    socket.on("error", (err) => {
        logger_1.logger.error("Socket.IO", {
            service: "Socket.IO",
            message: "Socket error",
            error: { name: err.name, message: err.message, stack: err.stack },
        });
    });
});
// === Main API routes ===
app.use("/api/auth", authRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
// === Connect to DB and start server ===
const PORT = process.env.PORT || 5000;
(0, db_1.default)()
    .then(() => {
    server.listen(PORT, () => {
        logger_1.logger.info("Server", {
            service: "Server",
            message: `Server running on port ${PORT}`,
        });
    });
})
    .catch((err) => {
    logger_1.logger.error("Server", {
        service: "Server",
        message: "Database connection failed",
        error: { name: err.name, message: err.message, stack: err.stack },
    });
    process.exit(1); // exit if DB fails
});
