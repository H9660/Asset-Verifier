import { parentPort } from "worker_threads";
import crypto from "crypto";

parentPort.on("message", (buffer) => {
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  parentPort.postMessage(hash);
});
