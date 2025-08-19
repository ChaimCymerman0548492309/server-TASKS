import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import connectDB from "./config/db";
import { logger } from "./config/logger";



// --- Express + Socket.IO setup ---
const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(express.json());

const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = isProd
  ? [
      "https://tasks-clint.netlify.app",
      "https://tasks-server.com",
      "https://tasks-server-production.up.railway.app",
    ]
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// === Health check ===
app.get("/api/is-alive", (req, res) => {
  logger.info("Server", { service: "Server", info: "Health check requested" });
  res.status(200).json({ status: "ok", message: "Server is alive" });
});

// === Socket status ===
let activeSockets = new Set<string>();
app.get("/api/socket-status", (req, res) => {
  logger.debug("Server", {
    service: "Server",
    activeSockets: activeSockets.size,
  });
  res.status(200).json({ status: "ok", activeConnections: activeSockets.size });
});

// === Socket.IO ===
export const io = new Server(server, {
  path: "/api/socket.io",
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  const origin = socket.handshake.headers.origin;
  logger.info("Socket.IO", {
    service: "Socket.IO",
    message: `Connected from origin: ${origin}`,
    socketId: socket.id,
  });

  activeSockets.add(socket.id);

  socket.on("disconnect", () => {
    logger.warn("Socket.IO", {
      service: "Socket.IO",
      message: `Disconnected from origin: ${origin}`,
      socketId: socket.id,
    });
    activeSockets.delete(socket.id);
  });

  socket.on("error", (err) => {
    logger.error("Socket.IO", {
      service: "Socket.IO",
      message: "Socket error",
      error: { name: err.name, message: err.message, stack: err.stack },
    });
  });
});

// === Main API routes ===
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// === Connect to DB and start server ===
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info("Server", {
        service: "Server",
        message: `Server running on port ${PORT}`,
      });
    });
  })
  .catch((err: Error) => {
    logger.error("Server", {
      service: "Server",
      message: "Database connection failed",
      error: { name: err.name, message: err.message, stack: err.stack },
    });
    process.exit(1); // exit if DB fails
  });
