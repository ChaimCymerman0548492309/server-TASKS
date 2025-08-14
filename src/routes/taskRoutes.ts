import { Router, RequestHandler } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/taskController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.post("/", createTask as RequestHandler);
router.get("/", getTasks as RequestHandler);
router.put("/:id", updateTask as unknown as RequestHandler);
router.delete("/:id", deleteTask as unknown as RequestHandler);


export default router;
