// components/ResumeBox.jsx
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { FiLink, FiCopy } from "react-icons/fi";
import { toastSetup } from "../config/toastSetup";
const shortenHash = (hash, start = 6, end = 4) => {
  if (!hash) return "";
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};

const ResumeBox = ({ resume, walletAddress, onView }) => {
  const handleGenerateLink = async () => {
    if (!walletAddress) {
      toast.error("Wallet address not available");
      return;
    }

    const baseUrl = window.location.origin;
    const resumeLink = `${baseUrl}/asset/${resume.transactionId}?wallet=${walletAddress}`;

    try {
      await navigator.clipboard.writeText(resumeLink);
      toast.success("Resume link copied to clipboard", toastSetup);
    } catch (err) {
      toast.error("Failed to copy link", toastSetup);
    }
  };

  return (
    <div className="flex items-center justify-between gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      {/* Left */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Asset ID
          </span>
          <span className="font-mono text-sm text-slate-800">
            {shortenHash(resume.resumeId, 10, 8)}
          </span>
          <FiCopy
            onClick={async () => {
              await navigator.clipboard.writeText(resume.resumeId);
              toast.success("Resume link copied to clipboard", toastSetup);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            Txn ID
          </span>
          <span className="font-mono text-sm text-slate-700">
            {shortenHash(resume.transactionId)}
          </span>
          <span>
            <FiCopy
              onClick={async () => {
                await navigator.clipboard.writeText(resume.transactionId);
                toast.success(
                  "Transaction link copied to clipboard",
                  toastSetup
                );
              }}
            />
          </span>
        </div>

        <span className="text-xs text-slate-500">
          Created{" "}
          {formatDistanceToNow(new Date(resume.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>

      {/* Right actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleGenerateLink}
          className="px-3 py-1 text-sm rounded-lg"
        >
          <FiLink size={25} />
        </button>

        <button
          onClick={() => onView(resume)}
          title="View resume"
          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default ResumeBox;
