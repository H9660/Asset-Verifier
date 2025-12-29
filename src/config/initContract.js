import Web3 from "web3";

import contractData from "../abi/ResumeValidator.json";
const web3 = new Web3(
  new Web3.providers.HttpProvider(import.meta.env.VITE_TEST)
);

const contractAddress = import.meta.env.VITE_CONTRACT_BATCH;

export const initContractInstance = async () => {
  const contractAbi = contractData.abi;
  // abiDecoder.addABI(contractAbi);
  // here we have uploaded the abi and now sma rt contract instance is created
  const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);
  return { contractAbi, contractInstance };
};
