import { useState } from "react";
import { Loader2Icon, X } from "lucide-react";
import { fetchLeetCodeQuestion } from "../lib/leetcode";
import toast from "react-hot-toast";

export default function FetchLeetCodeModal({ open, onClose, onQuestionFetched }) {
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
      <div className="modal-box w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Fetch LeetCode Question</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Question ID or Slug</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 1 or two-sum"
              className="input input-bordered w-full"
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

          <div className="alert alert-info mt-4">
            <div className="text-sm">
              <p>
                You can find the question ID or slug from the LeetCode URL:
              </p>
              <p className="mt-2 font-mono text-xs bg-base-300 p-2 rounded">
                leetcode.com/problems/<strong>two-sum</strong>/
              </p>
            </div>
          </div>
        </div>

        <div className="modal-action">
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
