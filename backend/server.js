import express from "express";
import hashAndUploadRoutes from "./routes/hashAndUploadRoutes.js";
import { configDotenv } from "dotenv";
configDotenv();
const app = express();
app.use(express.json());

app.use("/upload", hashAndUploadRoutes);
app.use("/hash", hashAndUploadRoutes);
app.listen(5000);
