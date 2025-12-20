import path from "path";
import fs from "fs";
import Contract from "@truffle/contract";
import WalletProvider from "@truffle/hdwallet-provider";

const contractAddress = process.env.CONTRACT;
const private_key = process.env.WALLET_PRIVATE_KEY;
const RPC_URL = process.env.TEST;
export const initContractInstance = async () => {
  const abiPath = path.resolve("abi/ResumeValidator.json");
  const rawData = fs.readFileSync(abiPath);
  const contractAbi = JSON.parse(rawData).abi;
  // here we have uploaded the abi and now sma rt contract instance is created
  const contract = Contract({ abi: contractAbi });
  const provider = new WalletProvider(private_key, RPC_URL);
  contract.setProvider(provider);
  const contractInstance = await contract.at(contractAddress);
  return contractInstance;
};
