// components/ResumeViewModal.jsx
import { FiX } from "react-icons/fi";

const shortenHash = (hash, start = 10, end = 8) =>
  `${hash.slice(0, start)}...${hash.slice(-end)}`;

const ResumeViewModal = ({ resume, walletAddress, onClose }) => {
  if (!resume) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100"
        >
          <FiX size={18} />
        </button>

        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Resume Details
        </h2>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-slate-500">Resume ID</p>
            <p className="font-mono text-slate-800">
              {shortenHash(resume.resumeId)}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Wallet Address</p>
            <p className="font-mono text-slate-800">
              {shortenHash(walletAddress, 8, 6)}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Transaction ID</p>
            <p className="font-mono text-slate-800">
              {shortenHash(resume.transactionId)}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Created At</p>
            <p className="text-slate-700">
              {new Date(resume.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewModal;
