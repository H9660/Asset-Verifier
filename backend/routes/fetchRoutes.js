import express from "express";
import multer from "multer";
import User from "../models/User.js";
const upload = multer();
const router = express.Router();

export const getAllResumes = async (req, res) => {
  try {
    const walletAddress = req.body.walletAddress;
    const userData = await User.findOne({
      walletAddress: walletAddress,
    });

    if (userData)
      res.status(200).json({
        resumes: userData.transactions,
      });
    else
      res.status(200).json({
        resumes: [],
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post("/getAllResumes", upload.none(), getAllResumes);
export default router;
