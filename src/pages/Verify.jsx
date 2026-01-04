import { toastSetup } from "../config/toastSetup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { verifyResume } from "../services/web3";

/* ---------------- helpers ---------------- */

const parseResumeLink = (url) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts[0] !== "asset") {
      toast.error("Invalid resume url", toastSetup);
      return null;
    }

    return {
      transactionId: parts[1],
      walletAddress: parsed.searchParams.get("wallet"),
    };
  } catch {
    return null;
  }
};

const normalizeSimilarProofs = (similarProofs = []) => {
  const map = {};

  similarProofs.flat().forEach(({ currCID, cid, simPercentage }) => {
    if (!map[currCID]) map[currCID] = [];
    map[currCID].push({
      cid,
      simPercentage: Math.round(simPercentage * 100),
    });
  });

  return map;
};

/* ---------------- component ---------------- */

function Verify() {
  const [resumeLink, setResumeLink] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [similarMap, setSimilarMap] = useState(null);

  const navigate = useNavigate();

  const handleVerify = async () => {
    const parsed = parseResumeLink(resumeLink);
    if (!parsed) {
      toast.error("Invalid asset link", toastSetup);
      return;
    }

    setVerifying(true);
    setResult(null);
    setSimilarMap(null);

    try {
      const verificationResult = await verifyResume(
        parsed.transactionId,
        parsed.walletAddress
      );

      setResult(verificationResult);

      if (verificationResult?.success && verificationResult?.similarProofs) {
        setSimilarMap(normalizeSimilarProofs(verificationResult.similarProofs));
      }
    } catch (err) {
      toast.error(err.message || "Verification failed", toastSetup);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Verify an Asset
        </h1>

        <input
          type="text"
          placeholder="Paste resume verification link"
          value={resumeLink}
          onChange={(e) => setResumeLink(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-slate-800"
        />

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/candidate")}
            disabled={verifying}
            className="flex-1 py-3 rounded-lg bg-slate-200 text-slate-800 font-medium hover:bg-slate-300 disabled:opacity-60"
          >
            Create Asset
          </button>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex-1 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center"
          >
            {verifying ? <ClipLoader size={18} color="white" /> : "Verify"}
          </button>
        </div>

        {/* ---------- status message ---------- */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm ${
              result.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {result.success
              ? "✅ Asset and related documents verified"
              : result.error}
          </div>
        )}

        {similarMap && (
          <div className="mt-8 space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Similarity Report
            </h2>

            {Object.entries(similarMap).map(([currCID, matches]) => (
              <div
                key={currCID}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
              >
                <p className="text-xs text-slate-500 mb-1">Current CID</p>
                <p className="text-sm font-mono break-all text-slate-800 mb-3">
                  {currCID}
                </p>

                <div className="space-y-2">
                  {matches.map(({ cid, simPercentage }) => (
                    <div
                      key={cid}
                      className="flex items-center justify-between bg-white border rounded-lg px-3 py-2"
                    >
                      <p className="text-xs font-mono break-all text-slate-700 w-4/5">
                        {cid}
                      </p>

                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          simPercentage >= 90
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {simPercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Verify;
