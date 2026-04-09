import { CheckIcon, CopyIcon, Link2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
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
    <div className="modal modal-open z-50">
      <div className="modal-box w-[min(90vw,30rem)] max-w-none p-0 overflow-hidden rounded-3xl border border-white/8 bg-[#162033] text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="relative px-5 pt-5 pb-3 text-center">
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </button>

          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#24344d] text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_rgba(15,23,42,0.35)]">
            <Link2Icon className="size-7" />
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-[1.7rem]">
            {headline}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-300">
            {subtitle}
          </p>
        </div>

        <div className="space-y-5 px-5 pb-5 pt-1">
          {meetingCode && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/85">
                Meeting code
              </p>
              <div className="rounded-2xl border border-white/6 bg-[#0f1727] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between gap-4">
                  <p className="min-w-0 wrap-break-word font-mono text-xl font-semibold tracking-[0.22em] text-slate-100 sm:text-[1.65rem]">
                    {meetingCode}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 rounded-xl border border-white/6 bg-white/5 px-2.5 py-2.5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                    title={copied ? "Copied" : "Copy meeting link"}
                  >
                    <CopyIcon className="size-4.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Invite link
            </p>
            <div className="flex items-stretch gap-2 rounded-2xl border border-white/6 bg-[#0f1727] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <input
                readOnly
                className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3.5 py-3 font-mono text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:outline-none"
                value={joinUrl}
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-sky-300 transition-colors hover:bg-slate-600 hover:text-sky-200"
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`btn w-full h-12 rounded-2xl border-0 text-sm font-semibold shadow-[0_14px_28px_rgba(41,159,255,0.24)] transition-all duration-200 ${
              copied
                ? "bg-linear-to-r from-emerald-400 to-emerald-500 text-slate-950 hover:from-emerald-300 hover:to-emerald-400"
                : "bg-linear-to-r from-sky-300 via-sky-400 to-cyan-500 text-slate-950 hover:from-sky-200 hover:via-sky-300 hover:to-cyan-400"
            }`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <CheckIcon className="size-4.5" />
                <span>Link copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="size-4.5" />
                <span>Copy meeting link</span>
              </>
            )}
          </button>

          {showJoinButton && onJoinMeeting ? (
            <button
              type="button"
              className="btn w-full h-11 rounded-2xl border border-white/8 bg-white/5 text-slate-100 text-sm transition-colors hover:bg-white/10"
              onClick={onJoinMeeting}
            >
              Join meeting now
            </button>
          ) : (
            <button
              type="button"
              className="btn w-full h-11 rounded-2xl border-0 bg-transparent text-slate-300 text-sm transition-colors hover:bg-white/5 hover:text-slate-100"
              onClick={onClose}
            >
              Done
            </button>
          )}
        </div>
      </div>
      <div
        className="modal-backdrop bg-slate-950/55"
        onClick={onClose}
        aria-hidden
      />
    </div>
  );
}
