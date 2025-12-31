import express from "express";
import multer from "multer";
import User from "../models/User.js";
import { compareChunkWise, hashFile } from "../utils/hashUtils.js";
import {
  getFilesByGroup,
  groupNameToId,
  getFileBuffers,
} from "../utils/generalUtils.js";
const upload = multer();
const router = express.Router();

const findSimilarProofs = (cid, buffers) => {
  // console.log("buffer is", buffers);
  // console.log(cid);
  let fileData = buffers.filter((buffer) => buffer.cid === cid);
  const fileBuffer = fileData[0].data;
  const fileType = fileData[0].type;

  const otherFileData = buffers.filter((file) => file.cid !== cid);
  const percentageCID = [];
  for (let i = 0; i < otherFileData.length; i++) {
    const currBuff = otherFileData[i].data;
    const currType = otherFileData[i].type;
    const currCID = otherFileData[i].cid;
    if (currType !== fileType) continue;
    const simPercentage = compareChunkWise(currBuff, fileBuffer);
    if (simPercentage > 0) percentageCID.push({ simPercentage, cid, currCID });
  }
  return percentageCID
    .sort((a, b) => b.simPercentage - a.simPercentage)
    .slice(0, 5);
  // the actual buffer for each file can be accessed with file.data for each element
};

const verifyProof = async (cid, hash, fileBuffers) => {
  try {
    let fileData = fileBuffers.filter((buffer) => buffer.cid === cid);
    if (!fileData) {
      return {
        success: false,
      };
    }
    fileData = fileData[0].data;
    const pinataFileHash = await hashFile(fileData);

    if ("0x" + pinataFileHash !== hash) {
      return {
        success: false,
        hash: hash,
      };
    } else {
      return {
        success: true,
      };
    }
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

    // console.log(proofHashData);
    const groupId = groupNameToId(proofHashData[0].groupName);
    const allGroupFiles = await getFilesByGroup(groupId);
    const filesCID = allGroupFiles.map((file) => {
      return file.ipfs_pin_hash;
    });

    const fileBuffers = await getFileBuffers(filesCID);
    // Here the file hash verification is done. After this we will match the file contents
    const promises = await Promise.all(
      proofHashData.map((proof) => {
        return verifyProof(proof.cid, proof.proofHash, fileBuffers);
      })
    );

    const wrongProofs = promises.filter((proof) => {
      proof.success = false;
    });

    if (wrongProofs.length != 0) {
      res.status(400).json({
        success: false,
      });
      return;
    }

    // At this point we are sure that all the files are actually valid and that we can proceed with the content match
    const similarProofs = await Promise.all(
      proofHashData.map((proof) => {
        return findSimilarProofs(proof.cid, fileBuffers);
      })
    );

    console.log(similarProofs);
    return res.status(200).json({
      success: true,
      message: "Proof verification successful!",
      similarProofs: similarProofs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post("/", upload.none(), verifyResume);
export default router;
