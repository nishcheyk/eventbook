import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./app/routes";
import "reflect-metadata";

const result = dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use((req, res, next) => {
  console.log(`Received ${req.method} on ${req.originalUrl}`);
  next();
});

export async function connectDB(uri: string) {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri);
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

if (process.env.NODE_ENV !== "test") {
  connectDB(process.env.MONGODB_URI!).then(() =>
    app.listen(3000, () => console.log("Server running on port 3000"))
  );
}

export default app;
