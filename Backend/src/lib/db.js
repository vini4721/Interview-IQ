import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.DB_URL);
    console.log("DB connected");
  } catch (error) {
    console.log("DB not connected");
    process.exit(1);
  }
};
