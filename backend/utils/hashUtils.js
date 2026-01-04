// import { resumeRegex } from "../constants.js";
import { Worker } from "worker_threads";
import crypto from "crypto";
export const resumeRegexString = `^(?:(?:resume|cv)[-_ ]*)?(?<name>[a-z]+(?:[-_ ]+[a-z]+)*)?(?:[-_ ]*\\d*)?\\$`;

const chunksize = process.env.COMPARE_CHUNK_SIZE;
export const normalizeResumeName = (resumeName) => {
  return resumeName.trim().toLowerCase().replace(/\s+/g, "-");
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

const getChunks = (buffer, chunkSize = chunksize) => {
  const hashes = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.slice(i, i + chunkSize);
    const hash = crypto.createHash("sha256").update(chunk).digest("hex");
    hashes.push(hash);
  }
  return hashes;
};

export const compareChunkWise = (buffer1, buffer2) => {
  const hA = getChunks(buffer1);
  const hB = new Set(getChunks(buffer2));

  let matches = 0;
  for (const h of hA) {
    if (hB.has(h)) matches++;
  }

  return matches / Math.max(hA.length, hB.size);
};

export const getResumeHash = (name, address) => {
  const compiledInput = name + address;
  const hash = crypto.createHash("sha256").update(compiledInput).digest("hex");
  return hash;
};
