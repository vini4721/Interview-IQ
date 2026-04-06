import toast from "react-hot-toast";
import { CheckIcon, CopyIcon, Link2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { formatMeetingCode, getMeetingJoinUrl } from "../lib/meeting";

/**
 * Google Meet–style panel: big join link, copy, optional “Join meeting” for post-create flow.
 */
export default function ShareMeetingDialog({
  open,
  onClose,
  sessionId,
  headline = "Share your meeting",
  subtitle = "Anyone with this link can ask to join. They must sign in with their account. This room allows up to 2 people.",
  showJoinButton = false,
  onJoinMeeting,
}) {
  const [copied, setCopied] = useState(false);

  if (!open || !sessionId) return null;

  const joinUrl = getMeetingJoinUrl(sessionId);
  const meetingCode = formatMeetingCode(sessionId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast.success("Meeting link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the link and copy manually.");
    }
  };

  return (
    <div className="modal modal-open z-[100]">
      <div className="modal-box max-w-lg p-0 overflow-hidden shadow-2xl border border-base-300">
        <div className="bg-gradient-to-r from-primary to-secondary px-6 py-5 text-primary-content flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 size-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Link2Icon className="size-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xl leading-tight">{headline}</h2>
              <p className="text-sm text-primary-content/90 mt-1 leading-snug">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost text-primary-content shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-base-100">
          <div>
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Meeting link</span>
            </label>
            <div className="join w-full">
              <input
                readOnly
                className="input input-bordered join-item flex-1 font-mono text-sm bg-base-200 border-base-300"
                value={joinUrl}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>

          {meetingCode && (
            <div className="rounded-xl bg-base-200 border border-base-300 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                Meeting code
              </p>
              <p className="font-mono text-lg font-bold tracking-wider text-base-content mt-1">
                {meetingCode}
              </p>
              <p className="text-xs text-base-content/50 mt-2">
                For your reference when sharing verbally. Guests still need the full link to join.
              </p>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary w-full gap-2 h-12 text-base"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <CheckIcon className="size-5" />
                Link copied
              </>
            ) : (
              <>
                <CopyIcon className="size-5" />
                Copy meeting link
              </>
            )}
          </button>

          {showJoinButton && onJoinMeeting && (
            <button type="button" className="btn btn-outline btn-neutral w-full" onClick={onJoinMeeting}>
              Join meeting now
            </button>
          )}

          {!showJoinButton && (
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} aria-hidden />
    </div>
  );
}
