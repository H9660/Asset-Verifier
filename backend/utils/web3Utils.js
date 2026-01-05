import path from "path";
import fs from "fs";
import Contract from "@truffle/contract";
import WalletProvider from "@truffle/hdwallet-provider";

const contractAddress = process.env.CONTRACT;
const private_key = process.env.WALLET_PRIVATE_KEY;
const RPC_URL = process.env.TEST;

export const provider = new WalletProvider({
  privateKeys: [private_key],
  providerOrUrl: RPC_URL,
  pollingInterval: 0, // 🔑 disables HTTP-style polling
});

const providerInit = (provider) => {
  // the funcitons here in the objects would
  // be affected becase here we are mutating the object and not just merely reassigning it
  // so this changes the provider object context
  provider.engine.on("error", (e) => {
    console.log("Provider error", e.message);
  });
  provider.engine.on("end", () => {
    console.log("Provider engine disconnected. Restarting...");
    provider = null;
  });
};

export const initContractInstance = async () => {
  const abiPath = path.resolve("abi/ResumeValidator.json");
  const rawData = fs.readFileSync(abiPath);
  const contractAbi = JSON.parse(rawData).abi;
  // here we have uploaded the abi and now sma rt contract instance is created
  const contract = Contract({ abi: contractAbi });
  contract.setProvider(provider);
  providerInit(provider);
  const contractInstance = await contract.at(contractAddress);
  return contractInstance;
};
