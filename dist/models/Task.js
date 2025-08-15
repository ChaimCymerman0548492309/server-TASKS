"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TaskSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "UserIDF", required: true },
    createdBy: { type: String, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // מוסיף אוטומטית createdAt
});
exports.default = (0, mongoose_1.model)("TaskIDF", TaskSchema);
