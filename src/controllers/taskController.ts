import { Request, Response } from "express";
import Task from "../models/Task";
import { io } from "../server";

interface AuthRequest extends Request {
  user?: {
    _id: string;
    username: string;
  };
}

export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "נדרש אימות משתמש" });
      return;
    }

    const task = new Task({
      ...req.body,
      createdBy: req.user.username,
      userId: req.user._id,
    });

    await task.save();

    io.emit("task_created", {
      ...task.toObject(),
      createdBy: req.user.username,
    });

    res.status(201).json({ ...task.toObject(), createdBy: req.user.username });
  } catch (err) {
    res.status(400).json({ error: "יצירת המשימה נכשלה" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    io.emit("task_updated", task);

    return res.json(task);
  } catch (err) {
    return res.status(400).json({ error: "Task update failed" });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    io.emit("task_deleted", { _id: req.params.id });

    return res.json({
      message: "Task deleted successfully",
      _id: req.params.id,
    });
  } catch (err) {
    return res.status(400).json({ error: "Task delete failed" });
  }
};
