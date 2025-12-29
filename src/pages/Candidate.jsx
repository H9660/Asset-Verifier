import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getResumeId,
  uploadFile,
  saveTransactionsToDB,
  getResumes,
} from "../services/api";
import ResumeBox from "../components/ResumeBox";
import ResumeViewModal from "../components/ResumeViewModal";
import { addProof, connectWallet } from "../services/web3";
import { ClipLoader } from "react-spinners";
import { toastSetup } from "../config/toastSetup";
const Candidate = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([""]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pinataFileData, setPinataFileData] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  const addLinkField = () => {
    setLinks((prev) => [...prev, ""]);
  };

  const removeLinkField = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const initWallet = async () => {
    const connectionData = await connectWallet();
    if (connectionData.success) {
      setWalletAddress(connectionData.address);
      toast.success("Metamask connected successfully", toastSetup);
    } else toast.error(connectionData.error);
  };

  const fetchResumes = async () => {
    toast.info("Fetching assets...", toastSetup);
    const resumesStatus = await getResumes(walletAddress);

    if (resumesStatus.success) {
      if (resumesStatus.parsedResumes.resumes.length) {
        toast.success("Assets fetched successfully!", toastSetup);
        setResumes(resumesStatus.parsedResumes.resumes);
      } else {
        toast.error("No assests found. Please store some first.", toastSetup);
      }
    } else {
      toast.error(resumesStatus.error, toastSetup);
    }
  };

  const handleCreateResume = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first", toastSetup);
      return;
    }

    if (!resumeTitle) {
      toast.error("Please enter a title for the resume.", toastSetup);
      return;
    }

    // console.log(files.length);
    if (files.length == 0) {
      toast.error("Please upload at least one file.", toastSetup);
      return;
    }

    try {
      setUploading(true);
      // so this fires all the calls at once and saves times
      const proofs = await Promise.all(files.map((file) => uploadFile(file)));

      setPinataFileData(proofs);

      const resumeId = await getResumeId(resumeTitle, walletAddress);

      const uploadData = proofs.map((proof) => {
        return {
          owner: walletAddress,
          cid: proof.CID,
          proofHash: "0x" + proof.hash,
        };
      });

      toast.info("Uploading data on blockchain.", toastSetup);
      const transactionStatus = await addProof(
        walletAddress,
        "0x" + resumeId,
        uploadData
      );
      console.log(walletAddress);

      if (transactionStatus.success) {
        toast.success("All proofs uploaded to blockchain!", toastSetup);
      } else {
        toast.error(transactionStatus.error.message, toastSetup);
        setUploading(false);
        setIsModalOpen(false);
        return;
      }

      toast.info("Saving transaction hash to the db", toastSetup);
      const saveToDB = await saveTransactionsToDB({
        walletAddress: walletAddress,
        transactionData: {
          transactionId: transactionStatus.transactionId,
          resumeId: resumeId,
        },
      });

      console.log(walletAddress);
      if (saveToDB.success) {
        console.log(saveToDB);
        toast.success("Resume created successfully", toastSetup);
      } else {
        toast.error(saveToDB.error);
      }
      setUploading(false);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error, toastSetup);
    }
  };
  useEffect(() => {
    window.ethereum.on("disconnect", (error) => {
      console.error("MetaMask disconnected:", error);
      alert("MetaMask has disconnected. Please reload the page to reconnect.");
      window.location.reload();
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (walletAddress) await fetchResumes();
    })();
  }, [files]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6 mb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Candidate Dashboard
              </h1>
              {walletAddress && (
                <p className="mt-1 text-sm text-slate-500">
                  Wallet: {walletAddress.slice(0, 6)}...
                  {walletAddress.slice(-4)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-7 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow hover:bg-slate-800 transition"
              >
                + Store Asset
              </button>

              <button
                onClick={initWallet}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium shadow-sm hover:bg-slate-50 transition"
              >
                Connect Wallet
              </button>

              <button
                onClick={fetchResumes}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium shadow-sm hover:bg-slate-50 transition"
              >
                Fetch Assets
              </button>

              <button
                onClick={() => navigate("/verify")}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium shadow-sm hover:bg-slate-50 transition"
              >
                Verify Asset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {resumes?.length > 0 ? (
            resumes.map((resume) => {
              console.log(walletAddress);
              return (
                <ResumeBox
                  key={resume._id}
                  resume={resume}
                  walletAddress={walletAddress}
                  onView={setSelectedResume}
                />
              );
            })
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-slate-500">
              <p>No assets created yet. Create one to get started.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Store Assets
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Asset name
              </label>
              <input
                type="text"
                placeholder="Abstract Artwork by Hussain"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload files
              </label>

              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-white hover:border-slate-400 transition">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    📎
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    Click to upload or drag & drop
                  </p>

                  <p className="text-xs text-slate-500">
                    PDFs, reports, certificates (max 10MB)
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-slate-800 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <div
                        onClick={() => {
                          const filteredFiles = [];
                          for (let i = 0; i < files.length; i++) {
                            if (i != idx) filteredFiles.push(files[i]);
                          }
                          console.log(filteredFiles);
                          setFiles(filteredFiles);
                        }}
                      >
                        X
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Links (Optional)
              </label>
              <div className="space-y-3">
                {links.map((link, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="https://github.com/..."
                      value={link}
                      onChange={(e) => handleLinkChange(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                    />
                    {links.length > 1 && (
                      <button
                        onClick={() => removeLinkField(idx)}
                        className="px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addLinkField}
                className="mt-3 text-sm font-medium text-slate-800 hover:underline"
              >
                + Add another link
              </button>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResume}
                className="w-40 px-6 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
              >
                {uploading ? (
                  <ClipLoader
                    color="white"
                    size={20}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : (
                  <div>Create Asset</div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedResume && (
        <ResumeViewModal
          resume={selectedResume}
          walletAddress={walletAddress}
          onClose={() => setSelectedResume(null)}
        />
      )}
    </div>
  );
};

export default Candidate;

// let me complete: alright so this is my flow here I have to create two pages one for the candidate where the candidate can upload his.her files, links etc and that data would be hashed by crypto. Now for each of the files that the user uploads there would be a CID that I will get after uploading it to pinata right. I will store the file hash and also its CID in the blockchain and this will constitute on object of the struct proof. Now I will also have one more struct called resume that would actually have the resume Id and also the list of the proofs that belong to that resume.
// 1. Now I have the files hashed and also have their CID.
// 2. Now I need to write smart contract to store the proofs in the blockchain with a transaction
// 3. There I will use my metamask wallet to sign the transaction and that would be put in the msg.sender
// 4. Now after all of this a link would be generated with my wallet address.
// 5. There would be a page called verify resume that a recruiter would use to verify the contents that I have uploaded to the blockchain.
// 6. When the recruiter will paste that link he she would be contacting the blockchain with their wallet address and the blockchain would be give them the CID and the hashes of the files that I have uploaded correcponding to the resumeId that I had created in the process. Now the recruiter will actually get query pinata with this data and pinata with the CID of the files that he has got from the blockchain
// and hen he will rehash those files. After that he would check if the newly computed hashes of the files are the same as the ones that he has got from Pinata
// and if that is the case then
// he be sure that the fileds files that he has got from pinata are indeed the ones that were been uploaded by the user
