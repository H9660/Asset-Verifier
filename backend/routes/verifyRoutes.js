import express from "express";
import pinata from "../config/pinata.js";
import multer from "multer";
import User from "../models/User.js";
import { hashFile } from "../utils/hashUtils.js";
const upload = multer();
const router = express.Router();

const verifyProof = async (cid, hash) => {
  try {
    const { data, contentType } = await pinata.gateways.public.get(cid);
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pinataFileHash = await hashFile(buffer);
    if ("0x" + pinataFileHash !== hash) {
      return {
        success: false,
        hash: hash,
      };
    } else
      return {
        success: true,
      };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
export const verifyResume = async (req, res) => {
  try {
    const walletAddress = req.body.walletAddress;
    const proofHashData = JSON.parse(req.body.proofHashData);
    const userData = await User.find({
      walletAddress: walletAddress,
    });

    if (!userData) {
      res.status(404).json({
        error: "User not found!",
      });
      return;
    }

    const promises = await Promise.all(
      proofHashData.map((proof) => {
        return verifyProof(proof.cid, proof.proofHash);
      })
    );

    const wrongProofs = promises.filter((proof) => {
      proof.success = false;
    });

    if (wrongProofs.length == 0) {
      res.status(200).json({
        success: true,
        message: "Proof verification successful!",
      });
    } else {
      res.status(400).json({
        success: false,
        wrongProofs: wrongProofs,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post("/", upload.none(), verifyResume);
export default router;
