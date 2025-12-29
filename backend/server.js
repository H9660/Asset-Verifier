import express from "express";
import hashAndUploadRoutes from "./routes/hashAndUploadRoutes.js";
import fetchRoutes from "./routes/fetchRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import dotenv from "dotenv";
import { connectDB, disconnectDb } from "./config/db.js";

dotenv.config();
const conn = await connectDB();
const app = express();
app.use(express.json());

app.use("/upload", hashAndUploadRoutes);
app.use("/hash", hashAndUploadRoutes);
app.use("/fetch", fetchRoutes);
app.use("/verify", verifyRoutes);
const server = app.listen(process.env.PORT || 5000);

process.on("SIGINT", async () => {
  // close instance
  const mongoc = conn.connections.length;
  const serverl = server.listening;

  if (mongoc == 0 && !serverl) return;
  console.log("Disconnecting Mongodb and shutting down the server.");
  if (mongoc) {
    await disconnectDb(conn);
    console.log("MongoDB disconnected!");
  }
  if (serverl)
    server.close(() => {
      console.log("Server shut down.");
    });
});
