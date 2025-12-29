import Web3 from "web3";
import { initContractInstance } from "./utils/web3Utils.js";
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.TEST));

const contractInstance = await initContractInstance();
const accounts = await contractInstance.constructor.web3.eth.getAccounts();

export const addProof = async (resumeId, proofHash, CID) => {
  const tx = await contractInstance.addProof(resumeId, proofHash, CID, {
    from: accounts[0],
    gas: 3600000,
  });

  return tx;
};

export const getProof = async (resumeId, proofHash) => {
  const events = await contractInstance.getPastEvents("ProofAdded", {
    filter: {
      owner: accounts[0],
      resumeId: resumeId,
      proofHash: proofHash,
    },
    fromBlock: 9884888,
    toBlock: 9884897,
  });

  return events;
};

export const test = async () => {
  const latestBlock = await web3.eth.getTransaction(
    "0x22a15122a794cacdcd8b5d348016f33d4237339093ee3202eb98758102b2ca07"
  );
  console.log("Transaction is\n", latestBlock);
};
