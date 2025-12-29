// pages/Verify.jsx
import { toastSetup } from "../config/toastSetup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { verifyResume } from "../services/web3"; // you’ll implement this

const parseResumeLink = (url) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] !== "asset") {
      toast.error("Invalid resume url", toastSetup);
      return;
    }

    // 7f504d3ffb81a591233ceab52dac39a3fe3626744ba0d04e29c43e28126326d2
    console.log(new URL(url).searchParams.get("wallet"));
    return {
      transactionId: parts[1],
      walletAddress: parsed.searchParams.get("wallet"),
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

function Verify() {
  const [resumeLink, setResumeLink] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [wrongProofs, setWrongProofs] = useState([]);
  const navigate = useNavigate();
  const handleVerify = async () => {
    console.log(resumeLink);
    const parsed = parseResumeLink(resumeLink);
    if (!parsed) {
      toast.error("Invalid asset link");
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      console.log(parsed.walletAddress);
      const verificationResult = await verifyResume(
        parsed.transactionId,
        parsed.walletAddress
      );

      console.log(verificationResult);
      setResult(verificationResult);
    } catch (err) {
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Verify an asset
        </h1>

        <input
          type="text"
          placeholder="Paste resume verification link"
          value={resumeLink}
          onChange={(e) => setResumeLink(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-slate-800"
        />
        <div className="flex justify-between">
          <button
            onClick={() => {
              navigate("/candidate");
            }}
            disabled={verifying}
            className="w-50 py-3 rounded-lg bg-slate-900 text-center text-white font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            Create Asset
          </button>
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-50 py-3 rounded-lg bg-slate-900 text-center text-white font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {verifying ? <ClipLoader size={20} color="white" /> : "Verify"}
          </button>
        </div>
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm ${
              result.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {result.success
              ? "✅ Asset and its related documents are authentic and verified"
              : result.error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Verify;
