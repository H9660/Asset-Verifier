import express from "express";
import multer from "multer";
import fileUploadRoute from "./routes/fileUploadRoute.js";
import { configDotenv } from "dotenv";
configDotenv();
const upload = multer();
const app = express();
app.use("/uploadFile", upload.single("file"), fileUploadRoute);

app.listen(5000);
