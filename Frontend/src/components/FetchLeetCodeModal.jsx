import { Loader2Icon, SearchIcon, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { fetchLeetCodeQuestion } from "../lib/leetcode";

export default function FetchLeetCodeModal({
  open,
  onClose,
  onQuestionFetched,
}) {
  const [questionId, setQuestionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    if (!questionId.trim()) {
      toast.error("Please enter a question ID or slug");
      return;
    }

    setIsLoading(true);
    const result = await fetchLeetCodeQuestion(questionId.trim());
    setIsLoading(false);

    if (result.success) {
      onQuestionFetched(result.data);
      setQuestionId("");
      onClose();
      toast.success(`Fetched: ${result.data.title}`);
    } else {
      toast.error(result.error);
    }
  };

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-[min(92vw,32rem)] max-w-none p-0 overflow-hidden rounded-[28px] border border-slate-700/70 bg-[#0f1a31] text-slate-100 shadow-[0_24px_70px_rgba(2,8,23,0.7)]">
        <div className="relative px-6 pt-6 pb-4 text-center bg-linear-to-b from-[#13213c] to-[#0f1a31]">
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-200"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-sky-100 to-cyan-200 text-sky-700 shadow-[0_10px_22px_rgba(14,165,233,0.18)]">
            <SearchIcon className="size-7" />
          </div>

          <h3 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-[2rem]">
            Import LeetCode Question
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-300">
            Paste a LeetCode URL, question number, or slug to load it into the
            session.
          </p>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-1 bg-[#0f1a31]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              LeetCode URL, ID, or slug
            </p>
            <div className="flex items-stretch gap-2 rounded-2xl border border-slate-700 bg-[#111e37] p-1.5">
              <input
                type="text"
                placeholder="e.g., https://leetcode.com/problems/two-sum/"
                className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3.5 py-3 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:outline-none"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
              <button
                type="button"
                className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
                onClick={handleFetch}
                disabled={isLoading}
              >
                {isLoading ? "..." : "Fetch"}
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700 bg-[#111e37] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              Tip
            </p>
            <p className="text-sm leading-6 text-slate-300">
              You can copy the slug directly from the LeetCode URL.
            </p>
            <p className="rounded-xl border border-slate-700 bg-[#0f1a31] px-3 py-2 font-mono text-xs text-slate-200 wrap-break-word">
              leetcode.com/problems/<strong>two-sum</strong>/
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              className="btn h-11 rounded-2xl border border-slate-600 bg-[#111e37] px-5 text-sm text-slate-200 transition-colors hover:bg-slate-700 hover:text-slate-100"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn h-11 rounded-2xl border-0 px-5 text-sm font-semibold shadow-[0_14px_28px_rgba(14,165,233,0.2)] transition-all duration-200 ${
                isLoading
                  ? "bg-linear-to-r from-sky-500 via-cyan-500 to-sky-600 text-white"
                  : "bg-linear-to-r from-sky-500 via-cyan-500 to-sky-600 text-white hover:from-sky-400 hover:via-cyan-400 hover:to-sky-500"
              }`}
              onClick={handleFetch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                "Fetch question"
              )}
            </button>
          </div>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop bg-slate-950/55"
        onClick={onClose}
      >
        <button />
      </form>
    </dialog>
  );
}
