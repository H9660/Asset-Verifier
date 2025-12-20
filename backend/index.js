import Web3 from "web3";
import web3 from "./config/web3.js";
const wb3 = new Web3(`https://mainnet.infura.io/v3/${web3.infuraProjectId}`);
async function getLatestBlockNumber() {
  const blockNumber = await wb3.eth.getBlockNumber();
  console.log("Latest block number:", blockNumber);
}

getLatestBlockNumber();
