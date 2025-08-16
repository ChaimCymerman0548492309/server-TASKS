import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import connectDB from "./config/db";

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(express.json());

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
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

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
  console.log(`Socket.IO connected from origin: ${origin}`);

  activeSockets.add(socket.id);

  socket.on("disconnect", () => {
    console.log(`Socket.IO disconnected from origin: ${origin}`);
    activeSockets.delete(socket.id);
  });
});

// === Main API routes ===
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
