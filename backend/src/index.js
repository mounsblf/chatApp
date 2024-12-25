import express from "express";
import authRoute from "./routes/auth.routes.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoute from "./routes/message.routes.js";
dotenv.config();

const PORT = process.env.PORT ;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);

app.listen(PORT, () => {
  console.log("Server is running on port"+ PORT);
  connectDB();
});
