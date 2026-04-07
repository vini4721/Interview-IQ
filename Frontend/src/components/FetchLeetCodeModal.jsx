import { Loader2Icon, X } from "lucide-react";
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
      <div className="modal-box w-full max-w-md p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-base-300/60 bg-base-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Import LeetCode Question</h3>
              <p className="text-sm text-base-content/65 mt-1">
                Paste a question number or slug to add it instantly.
              </p>
            </div>

            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Question ID or Slug</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 1 or two-sum"
              className="input input-bordered w-full bg-base-100/70"
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              disabled={isLoading}
              onKeyPress={(e) => e.key === "Enter" && handleFetch()}
            />
            <label className="label">
              <span className="label-text-alt">
                Enter the LeetCode question number or slug
              </span>
            </label>
          </div>

          <div className="alert mt-4 bg-base-200/60 border border-base-300/70">
            <div className="text-sm">
              <p className="font-medium">
                You can find it in the LeetCode URL:
              </p>
              <p className="mt-2 font-mono text-xs bg-base-300/70 p-2 rounded-lg">
                leetcode.com/problems/<strong>two-sum</strong>/
              </p>
            </div>
          </div>
        </div>

        <div className="modal-action m-0 px-6 py-4 border-t border-base-300/60 bg-base-200/40">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`btn btn-primary ${isLoading ? "loading" : ""}`}
            onClick={handleFetch}
            disabled={isLoading}
          >
            {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Fetching..." : "Fetch"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button />
      </form>
    </dialog>
  );
}
