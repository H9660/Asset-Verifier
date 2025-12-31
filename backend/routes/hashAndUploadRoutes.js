import express from "express";
import pinata from "../config/pinata.js";
import multer from "multer";
import { groupNameToId } from "../utils/generalUtils.js";
const upload = multer();
import {
  hashFile,
  getResumeHash,
  normalizeResumeName,
} from "../utils/hashUtils.js";
import { addProof } from "../web3.js";
import User from "../models/User.js";
const router = express.Router();

export const uploadFile = async (req, res) => {
  try {
    if (req.originalUrl !== "/upload/uploadFile") {
      res.status(400).json({
        error: "Invalid URL",
      });
      return;
    }

    if (!req.file || !req.body.groupName) {
      res.status(400).json({
        success: false,
        messsage: "File name or groupName is missing",
      });
      return;
    }

    const file = req.file;
    const groupId = groupNameToId(req.body.groupName);
    // console.log(file.buffer);
    const uploadResult = await pinata.upload.public
      .file(
        new File([file.buffer], file.originalname, {
          type: file.mimetype,
        })
      )
      .group(groupId);

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
    if (!resumeTitle || !walletAddress) {
      res.status(400).json({
        error: "Invalid resumetitle or walletAddress",
      });
      return;
    }

    const resumeId = getResumeHash(
      normalizeResumeName(resumeTitle),
      walletAddress
    );

    res.status(200).json({
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
    const resumeId = JSON.parse(req.body.resumeId);
    console.log(req.body);
    const proofs = JSON.parse(req.body.proofs);
    const uploadedProofs = await Promise.all(
      proofs.map((proof) =>
        addProof("0x" + resumeId, "0x" + proof.hash, proof.CID)
      )
    );

    res.status(200).send({
      success: "Proofs deployed on the blockchain",
      transactions: uploadedProofs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadTransactionsToDB = async (req, res) => {
  if (req.originalUrl !== "/upload/uploadTransactionsToDB") {
    res.status(400).json({
      error: "Invalid URL",
    });
    return;
  }
  try {
    const transactionData = JSON.parse(req.body.transactionData);
    const walletAddress = req.body.walletAddress;
    console.log(walletAddress);
    console.log(transactionData);
    // if (existingUser) {
    // existingUser.transactions = [
    //   ...existingUser.transactions,
    //   ...transactionData,
    // ];   this can cause duplicate pushes so we do it in a better way
    const upsertUser = await User.findOneAndUpdate(
      { walletAddress },
      {
        $setOnInsert: { walletAddress },
        $addToSet: {
          transactions: transactionData,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      user: upsertUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
};

router.post("/uploadFile", upload.single("file"), uploadFile);
router.post("/uploadToBlockchain", upload.none(), uploadToBlockchain);
router.post("/uploadTransactionsToDB", upload.none(), uploadTransactionsToDB);
router.post("/hashResume", upload.none(), hashResume);
export default router;
