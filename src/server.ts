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

// === Health check routes (ALWAYS OPEN) ===
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

// === Middleware ===
const allowedOrigins = [
  "http://localhost:5173",
  "https://tasks-clint.netlify.app",
  "https://tasks-server-production.up.railway.app", // Railway public URL
  "https://tasks-server.com", // Custom domain if you have
];

// CORS for HTTP requests (EXCLUDES health check)
app.use((req, res, next) => {
  if (req.path === "/api/is-alive") {
    return next(); // Skip CORS for health check
  }
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })(req, res, next);
});

// === Socket.IO with CORS ===
export const io = new Server(server, {
  path: "/api/socket.io",
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
