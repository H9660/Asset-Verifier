import express from "express";
import pinata from "../config/pinata.js";
import multer from "multer";
const upload = multer();
import {
  hashFile,
  getResumeHash,
  normalizeResumeName,
} from "../utils/hashUtils.js";
import { addProof, addResume } from "../index.js";
const router = express.Router();

export const uploadFile = async (req, res) => {
  try {
    if (req.originalUrl !== "/upload/uploadFile") {
      res.status(400).json({
        error: "Invalid URL",
      });
      return;
    }
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
};

export const hashResume = async (req, res) => {
  try {
    if (req.originalUrl !== "/hash/hashResume") {
      res.status(400).json({
        error: "Invalid URL",
      });
      return;
    }
    const resumeTitle = req.body.resumeTitle;
    const walletAddress = req.body.walletAddress;
    console.log(resumeTitle);
    if (!resumeTitle || !walletAddress) {
      res.status(400).json({
        error: "Invalid resumetitle or walletAddress",
      });
      return;
    }

    const finalResumeHash = getResumeHash(resumeTitle, walletAddress);
    const resumeId = getResumeHash(normalizeResumeName(resumeTitle), "");
    res.status(200).json({
      resumeHash: finalResumeHash,
      resumeId: resumeId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadToBlockchain = async (req, res) => {
  try {
    if (req.originalUrl !== "/upload/uploadToBlockchain") {
      res.status(400).json({
        error: "Invalid URL",
      });
      return;
    }

    if (!req.body) {
      res.status(400).json({
        error: "Invalid payload",
      });
      return;
    }
    const resumeHashData = JSON.parse(req.body.resumeHashData);
    const proofs = JSON.parse(req.body.proofs);
    const uploadedProofs = await Promise.all(
      proofs.map((proof) => addProof("0x" + proof.hash, proof.CID))
    );

    const proofsHashes = proofs.map((proof) => {
      return "0x" + proof.hash;
    });

    const uploadedResume = await addResume(
      "0x" + resumeHashData.resumeId,
      "0x" + resumeHashData.resumeHash,
      proofsHashes
    );

    res.status(200).send({
      success: "Proofs deployed on the blockchain",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
router.post("/uploadFile", upload.single("file"), uploadFile);
router.post("/uploadToBlockchain", upload.none(), uploadToBlockchain);
router.post("/hashResume", upload.none(), hashResume);
export default router;
