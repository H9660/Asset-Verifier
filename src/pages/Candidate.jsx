import { useState } from "react";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
function Candidate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([""]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const uploadFile = async (file) => {
    console.log(import.meta.env);
    const formdata = new FormData();
    formdata.append("file", file);
    const uploadStatus = await fetch(`/api/uploadFile`, {
      method: "POST",
      body: formdata,
    });

    const assetData = await uploadStatus.json();
    console.log(assetData);
    // return CID;
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

  const handleCreateResume = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    console.log(files);
    // need the logic here to open the wallet and then connect with the blockchain
    console.log({ resumeTitle, files, links });
    const promises = files.map((file) => {
      return uploadFile(file);
    });

    setUploading(true);
    await Promise.all(promises);
    setUploading(false);
    setIsModalOpen(false);
    toast.success(`All files uploaded successfully`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-10">
      <div className="max-w-4xl mx-auto">
        <div className="justify-flex">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-slate-800">
              Candidate Dashboard
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-medium shadow hover:bg-slate-800 transition"
              >
                + Create Resume
              </button>

              <button
                onClick={async () => {
                  if (window?.ethereum) {
                    console.log(window.ethereum);
                    try {
                      const accounts = await window.ethereum.request({
                        method: "eth_requestAccounts",
                      });
                      console.log("Connected:", accounts[0]); // this is the wallet addresss
                      setWalletAddress(accounts[0]);
                    } catch (err) {
                      console.error("Wallet connection failed", err);
                    }
                  } else {
                    alert(
                      "No Ethereum wallet detected. Please install MetaMask."
                    );
                  }
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium shadow hover:bg-slate-50 transition"
              >
                Connect Wallet
              </button>
            </div>
          </div>
          {walletAddress && <div>Your wallet addresss is ${walletAddress}</div>}
          {/* removed duplicate Create Resume button to keep both actions on the same line */}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-slate-500">
          <p>No resumes created yet. Create one to get started.</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Create Resume
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Resume title
              </label>
              <input
                type="text"
                placeholder="e.g. Backend Engineer Resume"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload files
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                <input type="file" multiple onChange={handleFileChange} />
                <p className="text-xs text-slate-500 mt-2">
                  PDFs, reports, certificates, etc.
                </p>
              </div>
              {files.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  {files.map((file, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-800" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Links
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
                  <div>Create Resume</div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
