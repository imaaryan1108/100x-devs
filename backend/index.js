import express from "express";
import cors from "cors";
const app = express();
import router from "./routes/index.js";
import mongoose from "mongoose";
import "dotenv/config";

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running", process.env.MONGODB_URI);
});
