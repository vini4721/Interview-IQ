import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  SparklesIcon,
  LogOutIcon,
  UsersIcon,
  TagIcon,
  ClockIcon,
  WifiIcon,
  MonitorIcon,
  UserCircleIcon,
  LoaderIcon,
  AlertCircleIcon,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const PROBLEM_DATA = {
  default: { title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"], description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target." },
  1: { title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"], description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target." },
  2: { title: "Reverse String", difficulty: "Easy", tags: ["String", "Two Pointers"], description: "Write a function that reverses a string in-place." },
};

const STARTER_CODE = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
};`;

const difficultyColor = (d) => {
  if (d === "Easy") return "badge-success";
  if (d === "Medium") return "badge-warning";
  return "badge-error";
};

// ─── Live Participant Count ───────────────────────────────────────────────────
function ParticipantCount() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  return (
    <span className="badge badge-outline badge-sm text-white/50 border-white/20">
      {participants.length}/2
    </span>
  );
}

// ─── Main Session Page ────────────────────────────────────────────────────────
export default function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [code, setCode] = useState(STARTER_CODE);
  const [showEndModal, setShowEndModal] = useState(false);

  // Derive problem from session id prefix e.g. "1-1712345"
  const problemKey = id?.split("-")[0];
  const problem = PROBLEM_DATA[problemKey] || PROBLEM_DATA.default;

  const firstName = user?.firstName || user?.username || "You";

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  // ── Initialize Stream Video ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    let _client;
    let _call;

    const init = async () => {
      try {
        // 1. Fetch token from your backend
        const res = await fetch("/api/stream/token", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
        const { token } = await res.json();

        // 2. Create Stream client
        _client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: user.id,
            name: user.fullName || user.username || user.id,
            image: user.imageUrl,
          },
          token,
        });

        // 3. Get or create the call — use session ID as the call ID
        _call = _client.call("default", id);
        await _call.join({ create: true });

        setClient(_client);
        setCall(_call);
        setStatus("ready");
      } catch (err) {
        console.error("Stream init error:", err);
        setErrorMsg(err.message || "Failed to connect to session.");
        setStatus("error");
      }
    };

    init();

    return () => {
      _call?.leave().catch(() => {});
      _client?.disconnectUser().catch(() => {});
    };
  }, [user, id]);

  const handleEndSession = async () => {
    setShowEndModal(false);
    await call?.leave().catch(() => {});
    await client?.disconnectUser().catch(() => {});
    navigate("/dashboard");
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center flex-col gap-4">
        <LoaderIcon className="size-10 text-emerald-400 animate-spin" />
        <p className="text-white/60 text-sm font-medium">Connecting to session…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center flex-col gap-4 px-4">
        <AlertCircleIcon className="size-10 text-red-400" />
        <p className="text-white font-bold text-lg">Could not join session</p>
        <p className="text-white/40 text-sm text-center max-w-sm">{errorMsg}</p>
        <p className="text-white/30 text-xs text-center max-w-sm mt-1">
          Make sure your backend is running and STREAM_API_KEY / STREAM_API_SECRET are set in your .env
        </p>
        <button onClick={() => navigate("/dashboard")} className="btn btn-sm btn-outline text-white mt-2">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Ready ──────────────────────────────────────────────────────────────────
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <div className="min-h-screen bg-[#0f0f13] text-white flex flex-col">

            {/* ── NAVBAR ── */}
            <nav className="bg-[#1a1a24]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow">
                    <SparklesIcon className="size-4 text-white" />
                  </div>
                  <span className="font-black text-base bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-mono tracking-wider hidden sm:block">
                    Talent IQ
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <span className="font-bold text-white/80 text-sm">{problem.title}</span>
                  <span className={`badge ${difficultyColor(problem.difficulty)} badge-sm font-semibold`}>
                    {problem.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
                    <ClockIcon className="size-4 text-emerald-400" />
                    <span className="font-mono text-sm text-white font-bold">{formatTime(elapsedSeconds)}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 rounded-lg px-3 py-1.5 border border-emerald-500/20">
                    <WifiIcon className="size-3.5 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-semibold">Live</span>
                  </div>
                  <button
                    onClick={() => setShowEndModal(true)}
                    className="btn btn-error btn-sm gap-2 bg-red-600 hover:bg-red-700 border-red-600 text-white"
                  >
                    <LogOutIcon className="size-4" />
                    End Session
                  </button>
                </div>
              </div>
            </nav>

            {/* ── MAIN LAYOUT ── */}
            <div
              className="flex flex-col lg:flex-row flex-1 overflow-hidden"
              style={{ height: "calc(100vh - 56px)" }}
            >
              {/* LEFT: Video + Code Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Live Video */}
                <div className="shrink-0 bg-[#13131d] border-b border-white/10" style={{ height: "220px" }}>
                  <SpeakerLayout participantsBarPosition="right" />
                </div>

                {/* Editor Toolbar */}
                <div className="bg-[#1a1a24] border-b border-white/10 px-4 py-2 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-500 opacity-70" />
                    <div className="size-3 rounded-full bg-yellow-500 opacity-70" />
                    <div className="size-3 rounded-full bg-green-500 opacity-70" />
                    <span className="font-mono text-xs text-white/30 ml-2">solution.js</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MonitorIcon className="size-4 text-white/30" />
                    <span className="text-xs text-white/40 font-mono">JavaScript</span>
                  </div>
                </div>

                {/* Code textarea */}
                <div className="flex-1 overflow-hidden">
                  <textarea
                    className="w-full h-full font-mono text-sm p-5 resize-none outline-none leading-relaxed"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      background: "#1e1e2e",
                      color: "#cdd6f4",
                    }}
                  />
                </div>

                {/* Status bar */}
                <div className="bg-[#13131d] border-t border-white/10 px-4 py-2 flex items-center gap-4 text-xs text-white/30 shrink-0">
                  <span>JavaScript</span>
                  <span>•</span>
                  <span>UTF-8</span>
                  <span>•</span>
                  <span className="text-emerald-400">● Connected</span>
                </div>

                {/* Stream Call Controls */}
                <div className="bg-[#1a1a24] border-t border-white/10 py-2 flex justify-center shrink-0">
                  <CallControls onLeave={handleEndSession} />
                </div>
              </div>

              {/* RIGHT: Problem + Participants */}
              <div className="w-full lg:w-[300px] bg-[#1a1a24] border-l border-white/10 flex flex-col overflow-hidden">
                {/* Problem */}
                <div className="p-5 border-b border-white/10 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-white">{problem.title}</h2>
                    <span className={`badge ${difficultyColor(problem.difficulty)} badge-sm font-semibold`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <TagIcon className="size-2.5" />{t}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{problem.description}</p>
                </div>

                {/* Participants */}
                <div className="p-5 border-b border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
                      <UsersIcon className="size-4" />
                      Participants
                    </div>
                    <ParticipantCount />
                  </div>

                  {/* Current user */}
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-emerald-500/20">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={firstName} className="size-8 rounded-full ring-2 ring-emerald-500/50" />
                    ) : (
                      <UserCircleIcon className="size-8 text-emerald-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{firstName}</p>
                      <p className="text-xs text-emerald-400">Host</p>
                    </div>
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Waiting slot */}
                  <div className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-3 border border-white/10 border-dashed">
                    <div className="size-8 rounded-full bg-white/5 flex items-center justify-center">
                      <UserCircleIcon className="size-5 text-white/20" />
                    </div>
                    <div>
                      <p className="text-sm text-white/30 font-medium">Waiting for participant…</p>
                      <p className="text-xs text-white/20">Share the link below to invite</p>
                    </div>
                  </div>
                </div>

                {/* Session Info + Invite */}
                <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-white/70">Session Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Duration</span>
                      <span className="font-mono text-white/70">{formatTime(elapsedSeconds)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Type</span>
                      <span className="text-white/70">1-on-1 Interview</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Call ID</span>
                      <code className="font-mono text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded truncate max-w-[140px]">{id}</code>
                    </div>
                  </div>

                  {/* Invite link */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2">
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Invite Link</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-white/50 flex-1 truncate">
                        {window.location.href}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                        className="btn btn-xs btn-ghost text-emerald-400 hover:text-emerald-300 shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── END SESSION MODAL ── */}
            {showEndModal && (
              <div className="modal modal-open">
                <div className="modal-box bg-[#1a1a24] border border-white/20 max-w-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500/10 p-3 rounded-xl">
                      <LogOutIcon className="size-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">End Session?</h3>
                      <p className="text-sm text-white/50">This will disconnect all participants.</p>
                    </div>
                  </div>
                  <div className="modal-action">
                    <button onClick={() => setShowEndModal(false)} className="btn btn-ghost text-white/70">
                      Cancel
                    </button>
                    <button onClick={handleEndSession} className="btn btn-error gap-2">
                      <LogOutIcon className="size-4" />
                      End Session
                    </button>
                  </div>
                </div>
                <div className="modal-backdrop bg-black/60" onClick={() => setShowEndModal(false)} />
              </div>
            )}
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
