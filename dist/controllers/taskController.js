"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const server_1 = require("../server");
const createTask = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "נדרש אימות משתמש" });
            return;
        }
        const task = new Task_1.default({
            ...req.body,
            createdBy: req.user.username,
            userId: req.user._id,
        });
        await task.save();
        server_1.io.emit("task_created", {
            ...task.toObject(),
            createdBy: req.user.username,
        });
        res.status(201).json({ ...task.toObject(), createdBy: req.user.username });
    }
    catch (err) {
        res.status(400).json({ error: "יצירת המשימה נכשלה" });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find();
        res.json(tasks);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};
exports.getTasks = getTasks;
const updateTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        server_1.io.emit("task_updated", task);
        return res.json(task);
    }
    catch (err) {
        return res.status(400).json({ error: "Task update failed" });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        server_1.io.emit("task_deleted", { _id: req.params.id });
        return res.json({
            message: "Task deleted successfully",
            _id: req.params.id,
        });
    }
    catch (err) {
        return res.status(400).json({ error: "Task delete failed" });
    }
};
exports.deleteTask = deleteTask;
