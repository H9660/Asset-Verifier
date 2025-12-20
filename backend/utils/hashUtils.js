import { resumeRegex } from "../constants.js";
import { Worker } from "worker_threads";
import crypto from "crypto";
import { generateNonce } from "./cryptoUtils.js";
export const normalizeResumeName = (resumeName) => {
  const match = resumeRegex.match(resumeName);
  if (!match) {
    throw new Error("Invalid resume filename");
  }

  const name = match.groups?.name;

  // Generic resumes → resume.pdf
  if (!name) {
    return "resume.pdf";
  }

  // Normalize person name
  return name.toLowerCase().trim().replace(/[_ ]+/g, "-") + ".pdf";
};

export const hashFile = async (buffer) => {
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

export const getResumeHash = (name, address) => {
  const compiledInput = name + address;
  const hash = crypto.createHash("sha256").update(compiledInput).digest("hex");
  return hash;
};
