import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userName: String,
  message: String,
  timeStamp: Date,
});

export const chatModel = mongoose.model("chat", chatSchema);
