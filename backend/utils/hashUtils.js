// import { resumeRegex } from "../constants.js";
import { Worker } from "worker_threads";
import crypto from "crypto";
export const resumeRegexString = `^(?:(?:resume|cv)[-_ ]*)?(?<name>[a-z]+(?:[-_ ]+[a-z]+)*)?(?:[-_ ]*\\d*)?\\.pdf$`;

const resumeRegex = new RegExp(resumeRegexString, "i");

export const normalizeResumeName = (resumeName) => {
  const match = resumeName.match(resumeRegex);
  console.log(match);
  if (!match) {
    throw new Error("Invalid resume filename");
  }

  const name = match.groups?.name;

  // Generic resumes → resume.pdf
  if (!name) {
    return "resume.pdf";
  }

  // Normalize person name
  return name.toLowerCase().trim().replace(/[_ ]+/g, "-") + ".pdf" + Date.now();
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
