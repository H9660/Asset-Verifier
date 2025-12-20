import Web3 from "web3";
import { initContractInstance } from "./utils/web3Utils.js";
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.TEST));

const contractInstance = await initContractInstance();
const accounts = await contractInstance.constructor.web3.eth.getAccounts();
// VERY IMPORTANT POINT HERE:
export const addProof = async (proofHash, CID) => {
  const tx = await contractInstance.addProof(proofHash, CID, {
    from: accounts[0],
    gas: 3600000,
  });

  return tx;
};

export const addResume = async (resumeId, resumeHash, proofs) => {
  const tx = await contractInstance.createResume(resumeId, resumeHash, proofs, {
    from: accounts[0],
    gas: 3600000,
  });

  return tx;
};
