import { Schema, model, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  userId: Schema.Types.ObjectId;
  createdBy: string;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "UserIDF", required: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default model<ITask>("TaskIDF", TaskSchema);
