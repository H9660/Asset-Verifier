import express from "express";
import pinata from "../config/pinata.js";
import crypto from "crypto";
import { Worker } from "worker_threads";
const router = express.Router();

const hashFile = async (buffer) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./workers/hash.worker.js");
    worker.postMessage(buffer);
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code != 0) {
        reject(new Error(`Worker exited with the code ${code}`));
      }
    });
  });
};

router.post("/", async (req, res) => {
  try {
    const file = req.file;

    const uploadResult = await pinata.upload.public.file(
      new File([file.buffer], file.originalname, {
        type: file.mimetype,
      })
    );

    const hash = await hashFile(file.buffer);
    res.status(200).json({
      CID: uploadResult.cid,
      hash: hash,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
