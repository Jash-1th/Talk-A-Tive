import mongoose from "mongoose";

export async function connectDB(URL) {
    await mongoose.connect(URL);
}