import { initContractInstance } from "../config/initContract";
const { contractAbi, contractInstance } = await initContractInstance();
const contractAddress = import.meta.env.VITE_CONTRACT_BATCH;
import Web3 from "web3";
import { verify } from "./api";
const web3 = new Web3(
  new Web3.providers.HttpProvider(import.meta.env.VITE_TEST)
);

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      let addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      let actualAddressArray = addressArray.map((address, id) => {
        return web3.utils.toChecksumAddress(address);
      });

      console.log(actualAddressArray);
      return {
        address: actualAddressArray[0],
        success: true,
      };
    } catch (err) {
      return {
        address: "",
        success: false,
        error: err.message,
      };
    }
  } else {
    return {
      address: "",
      success: false,
      error: "No ethereum object detected. Please install metamask.",
    };
  }
};
// if some other person has my public key and then has my file he can
// Smart contract events are a way for your contract to communicate that something happened (i.e. there was an event) on the blockchain to your front-end application, which can be 'listening' for specific events and take action when they happen.
export const addProof = async (walletAddress, resumeId, proofData) => {
  const TARGET_CHAIN = "0xaa36a7"; // Sepolia

  const currentChain = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChain !== TARGET_CHAIN) {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: TARGET_CHAIN }],
    });
  }

  const params = {
    to: contractAddress, // Required except during contract publications.
    from: walletAddress, // must match user's active address.
    data: contractInstance.methods.addProofs(resumeId, proofData).encodeABI(),
  };

  //sign the transaction
  try {
    // metamask will choose the chain which it has to work with
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [params],
    });

    console.log(txHash);
    return {
      success: true,
      transactionId: txHash,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const verifyResume = async (transactionId, walletAddress) => {
  try {
    const trxn = await web3.eth.getTransaction(transactionId);
    const input = trxn.input;

    const methodId = input.slice(0, 10);

    const methodAbi = contractAbi.find(
      (item) =>
        item.type === "function" &&
        web3.eth.abi.encodeFunctionSignature(item) === methodId
    );

    if (!methodAbi) {
      throw new Error("Function ABI not found – ABI mismatch or proxy call");
    }

    const decoded = web3.eth.abi.decodeParameters(
      methodAbi.inputs,
      input.slice(10)
    );

    const proofHashData = decoded.proofHashData;
    console.log(proofHashData);
    console.log(walletAddress);
    if (proofHashData && walletAddress != proofHashData[0].owner) {
      return {
        success: false,
        error: "The user does not own this asset!",
      };
    }

    const res = await verify(walletAddress, proofHashData);

    if (res.success) {
      return {
        success: true,
        similarProofs: res.similarProofs,
      };
    } else
      return {
        success: false,
        error: res.error,
      };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
