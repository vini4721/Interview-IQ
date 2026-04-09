import { UserButton, useUser } from "@clerk/clerk-react";
import { Loader2Icon, SearchIcon, SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  useActiveSessions,
  useCreateSession,
  useMyRecentSessions,
} from "../hooks/useSessions";

import CreateSessionModal from "../components/CreateSessionModal";
import FetchLeetCodeModal from "../components/FetchLeetCodeModal";
import { PROBLEMS } from "../data/problems";
import { getCustomProblems, saveCustomProblem } from "../lib/problemStore";
import { getDifficultyBadgeClass } from "../lib/utils";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });
  const [sessionFilter, setSessionFilter] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [problemSearch, setProblemSearch] = useState("");
  const [fetchLeetCodeOpen, setFetchLeetCodeOpen] = useState(false);
  const [customProblems, setCustomProblems] = useState(() =>
    getCustomProblems(),
  );

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } =
    useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } =
    useMyRecentSessions();

  const handleCreateRoom = async () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    try {
      const data = await createSessionMutation.mutateAsync({
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      });

      if (!data?.session?._id) return;

      setShowCreateModal(false);
      setRoomConfig({ problem: "", difficulty: "" });
      navigate(`/session/${data.session._id}`, {
        state: { openShareMeeting: true },
      });
    } catch {
      // Mutation hook handles toast errors.
    }
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];
  const allProblems = useMemo(
    () => [...customProblems, ...Object.values(PROBLEMS)],
    [customProblems],
  );
  const filteredProblems = useMemo(() => {
    if (!problemSearch.trim()) return allProblems;

    const query = problemSearch.toLowerCase();
    return allProblems.filter(
      (problem) =>
        problem.title.toLowerCase().includes(query) ||
        problem.category.toLowerCase().includes(query) ||
        String(problem.difficulty || "")
          .toLowerCase()
          .includes(query),
    );
  }, [allProblems, problemSearch]);
  const filteredActiveSessions = activeSessions.filter(
    (session) =>
      session?.status === "active" &&
      (session.problem || "")
        .toLowerCase()
        .includes(sessionFilter.toLowerCase()),
  );
  const telemetryStatus = activeSessions.length > 0 ? "ACTIVE" : "STABLE";
  const systemEvents = recentSessions.slice(0, 3).map((session, index) => ({
    id: session._id,
    level: index === 2 ? "warning" : "info",
    title:
      index === 2
        ? "Minor latency spike detected"
        : `Candidate session '${session.problem}' completed`,
    detail:
      index === 2
        ? "Gateway jitter increased briefly. Auto-routing protocol remained stable."
        : `Session closed by host. Difficulty: ${String(session.difficulty || "easy").toUpperCase()}.`,
    time: new Date(session.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return (
      session.host?.clerkId === user.id ||
      session.participant?.clerkId === user.id
    );
  };

  const handleQuestionFetched = (question) => {
    saveCustomProblem(question);
    setCustomProblems(getCustomProblems());
  };

  return (
    <>
      <div className="min-h-screen bg-[#05070d] relative overflow-hidden text-[#e7ebf3]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(126,175,228,0.18),transparent_35%),radial-gradient(circle_at_82%_20%,rgba(76,135,198,0.14),transparent_30%),linear-gradient(180deg,#05070d_0%,#071122_48%,#0a1728_100%)]" />
          <div className="absolute -top-24 left-[10%] h-80 w-80 rounded-full bg-[#3a6ea2]/20 blur-3xl" />
          <div className="absolute top-[15%] -right-24 h-72 w-72 rounded-full bg-[#4f89c0]/15 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[35%] h-80 w-80 rounded-full bg-[#2d5f92]/15 blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <main className="max-w-7xl mx-auto">
            <div className="rounded-2xl border border-[#2f4463]/80 bg-[#0d1730]/82 backdrop-blur-xl px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm tracking-wider font-semibold text-[#ecf3ff]">
                      INTERVIEWIQ
                    </p>
                    <p className="text-[11px] text-[#90a6c4]">ENGINE v2.0.1</p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 text-sm">
                  {[
                    { id: "dashboard", label: "Dashboard" },
                    { id: "problems", label: "Problems" },
                    { id: "history", label: "History" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-lg border px-3 py-2 transition-colors ${activeTab === tab.id ? "border-[#4f76b3] bg-[#1e2f54]/92 text-[#f3b230]" : "border-transparent text-[#7f95b2] hover:border-[#344e73] hover:text-[#e7efff]"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-[#3e5b85] p-0.5">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {activeTab === "dashboard" && (
              <>
                <section className="mt-5 rounded-2xl border border-[#2e4262] bg-[#0f1a31]/82 p-6 sm:p-7 shadow-[0_14px_34px_rgba(4,8,18,0.52)]">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-[#f0b12e] font-semibold">
                        SYSTEM HEALTH: OPTIMAL
                      </p>
                      <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight text-[#edf3ff]">
                        Welcome back, {user?.firstName || "there"}!
                      </h1>
                      <p className="mt-3 text-[#a1b4cf] max-w-2xl">
                        Ready for another deep dive? Your engine is primed for
                        the next interview round.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-[#8ea4c4]">
                        <span className="rounded-lg border border-[#334a6a] bg-[#111e37] px-3 py-1.5">
                          ENGINE LATENCY: 12MS
                        </span>
                        <span className="rounded-lg border border-[#334a6a] bg-[#111e37] px-3 py-1.5">
                          ACTIVE NODES: 1,420
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="btn rounded-xl px-8 bg-[#2098cf] hover:bg-[#2baeea] border-[#2098cf] text-[#052236] shadow-[0_12px_30px_rgba(32,152,207,0.35)]"
                    >
                      CREATE SESSION
                      <SparklesIcon className="size-4" />
                    </button>
                  </div>
                </section>

                <section className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="card border border-[#2e4262] bg-[#161f38]/92 shadow-[0_10px_28px_rgba(4,8,18,0.5)]">
                    <div className="card-body p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] tracking-[0.2em] text-[#8fa5c4]">
                          REAL-TIME ACTIVE SESSIONS
                        </p>
                        <span className="badge badge-sm border-[#3a5b86] text-[#8fc1ff] bg-[#132544]">
                          LIVE
                        </span>
                      </div>
                      <p className="text-4xl font-black mt-3 text-[#f0f5ff]">
                        {activeSessions.length}
                      </p>
                      <p className="text-xs text-[#8fa5c4] mt-1">/24 slots</p>
                    </div>
                  </div>

                  <div className="card border border-[#2e4262] bg-[#161f38]/92 shadow-[0_10px_28px_rgba(4,8,18,0.5)]">
                    <div className="card-body p-5">
                      <p className="text-[11px] tracking-[0.2em] text-[#8fa5c4]">
                        AGGREGATE COMPLETED
                      </p>
                      <p className="text-4xl font-black mt-3 text-[#f0f5ff]">
                        {recentSessions.length.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#8fa5c4] mt-1">
                        session history
                      </p>
                    </div>
                  </div>

                  <div className="card border border-[#2e4262] bg-[#161f38]/92 shadow-[0_10px_28px_rgba(4,8,18,0.5)]">
                    <div className="card-body p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] tracking-[0.2em] text-[#8fa5c4]">
                          TELEMETRY STREAM STATUS
                        </p>
                        <span
                          className={`badge badge-sm border ${telemetryStatus === "ACTIVE" ? "border-[#206c5d] text-[#7ef2d0] bg-[#11362f]" : "border-[#2f4f77] text-[#9ec6ff] bg-[#152740]"}`}
                        >
                          {telemetryStatus}
                        </span>
                      </div>
                      <p className="text-4xl font-black mt-3 text-[#f0f5ff]">
                        {telemetryStatus === "ACTIVE" ? "Live" : "Stable"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mt-10">
                  <div className="flex items-center justify-between pb-3 border-b border-[#273a58]/65">
                    <h2 className="text-2xl font-semibold text-[#d7e6ff]">
                      Ongoing Sessions
                    </h2>
                    <div className="w-full max-w-60 flex items-center gap-2 px-3 py-2 rounded-xl border border-[#334a6a] bg-[#111e37]/85">
                      <SearchIcon className="size-4 text-[#8ea4c4]" />
                      <input
                        value={sessionFilter}
                        onChange={(e) => setSessionFilter(e.target.value)}
                        placeholder="Filter problems..."
                        className="w-full bg-transparent text-xs text-[#9db3d1] placeholder:text-[#7088aa] outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#2f4463] bg-[#0d1730]/78">
                    <div className="grid grid-cols-12 gap-3 px-4 py-3 text-[11px] tracking-[0.16em] text-[#8ea4c4] bg-[#1a2643]">
                      <div className="col-span-5 md:col-span-4">
                        PROBLEM NAME
                      </div>
                      <div className="hidden md:block md:col-span-2">
                        DIFFICULTY
                      </div>
                      <div className="hidden md:block md:col-span-3">HOST</div>
                      <div className="col-span-3 md:col-span-1 text-right md:text-left">
                        PLAYERS
                      </div>
                      <div className="col-span-4 md:col-span-2 text-right">
                        ACTIONS
                      </div>
                    </div>

                    {loadingActiveSessions ? (
                      <div className="px-4 py-14 flex justify-center">
                        <Loader2Icon className="size-7 animate-spin text-[#7fb2ea]" />
                      </div>
                    ) : filteredActiveSessions.length === 0 ? (
                      <div className="px-4 py-14 text-center text-[#90a6c4]">
                        No ongoing sessions right now.
                      </div>
                    ) : (
                      filteredActiveSessions.map((session) => {
                        const full =
                          session.participant && !isUserInSession(session);
                        return (
                          <div
                            key={session._id}
                            className="grid grid-cols-12 gap-3 items-center px-4 py-4 border-t border-[#273a58]/65 hover:bg-[#122142]/55"
                          >
                            <div className="col-span-5 md:col-span-4 min-w-0">
                              <p className="font-semibold truncate text-[#e7efff]">
                                {session.problem}
                              </p>
                              <p className="text-[11px] text-[#7f95b2] truncate">
                                Collaborative coding interview
                              </p>
                            </div>
                            <div className="hidden md:block md:col-span-2">
                              <span
                                className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}
                              >
                                {String(
                                  session.difficulty || "easy",
                                ).toUpperCase()}
                              </span>
                            </div>
                            <div className="hidden md:flex md:col-span-3 items-center gap-2 min-w-0">
                              <div className="avatar">
                                <div className="w-6 rounded border border-[#425f89]">
                                  <img
                                    src={session.host?.profileImage}
                                    alt={session.host?.name}
                                  />
                                </div>
                              </div>
                              <span className="text-sm truncate text-[#b8cbe6]">
                                {session.host?.name}
                              </span>
                            </div>
                            <div className="col-span-3 md:col-span-1 text-sm font-semibold text-right md:text-left text-[#d3e1f8]">
                              {session.participant ? "2/2" : "1/2"}
                            </div>
                            <div className="col-span-4 md:col-span-2 flex justify-end">
                              {full ? (
                                <button className="btn btn-sm btn-disabled rounded-lg">
                                  FULL
                                </button>
                              ) : (
                                <Link
                                  to={`/session/${session._id}`}
                                  className="btn btn-sm rounded-lg border-[#46679a] text-[#deebff] bg-[#14284f] hover:bg-[#1a3565]"
                                >
                                  {isUserInSession(session) ? "Rejoin" : "Join"}
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="mt-10">
                  <div className="flex items-center justify-between pb-3 border-b border-[#273a58]/65">
                    <h2 className="text-2xl font-semibold text-[#d7e6ff]">
                      System Events & Logs
                    </h2>
                    <span className="text-xs tracking-[0.05em] text-[#8db2df]">
                      View Full Audit Log
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#2f4463] bg-[#101b33]/86 p-3 sm:p-4 space-y-2">
                    {loadingRecentSessions ? (
                      <div className="px-4 py-14 flex justify-center">
                        <Loader2Icon className="size-7 animate-spin text-[#7fb2ea]" />
                      </div>
                    ) : (
                      (systemEvents.length > 0
                        ? systemEvents
                        : [
                            {
                              id: "fallback-1",
                              level: "info",
                              title: "System boot complete",
                              detail:
                                "Realtime orchestration engine is online and ready.",
                              time: "--:--",
                            },
                          ]
                      ).map((event) => (
                        <div
                          key={event.id}
                          className="rounded-xl border border-[#2c4264] bg-[#0f1931] px-4 py-3 flex items-start gap-3"
                        >
                          <span
                            className={`mt-2 inline-block h-2 w-2 rounded-full ${event.level === "warning" ? "bg-[#ffb86c]" : "bg-[#7fc8ff]"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#dfebff]">
                              {event.title}
                            </p>
                            <p className="text-xs text-[#8ea4c4] mt-1 truncate">
                              {event.detail}
                            </p>
                          </div>
                          <span className="text-[11px] text-[#6f86a8]">
                            {event.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === "problems" && (
              <section className="mt-5">
                <div className="rounded-2xl border border-[#2e4262] bg-[#0f1a31]/82 p-6 sm:p-7 shadow-[0_14px_34px_rgba(4,8,18,0.52)]">
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#273a58]/65">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#d7e6ff]">
                        Practice Problems
                      </h2>
                      <p className="mt-1 text-sm text-[#9bb0ce]">
                        Pick any problem and start practicing immediately.
                      </p>
                    </div>
                    <span className="text-xs tracking-[0.08em] text-[#8db2df]">
                      {allProblems.length} TOTAL
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:max-w-sm flex items-center gap-2 px-3 py-2 rounded-xl border border-[#334a6a] bg-[#111e37]/85">
                      <SearchIcon className="size-4 text-[#8ea4c4]" />
                      <input
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        placeholder="Search by title, category or difficulty..."
                        className="w-full bg-transparent text-xs text-[#9db3d1] placeholder:text-[#7088aa] outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setFetchLeetCodeOpen(true)}
                      className="btn btn-sm rounded-lg border-[#46679a] text-[#deebff] bg-[#14284f] hover:bg-[#1a3565]"
                    >
                      Fetch from LeetCode
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {filteredProblems.length > 0 ? (
                      filteredProblems.map((problem) => (
                        <Link
                          key={problem.id}
                          to={`/problem/${problem.id}`}
                          className="rounded-xl border border-[#2f4463] bg-[#0f1931] px-4 py-4 hover:bg-[#122142]/60 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#dfebff]">
                                {problem.title}
                              </p>
                              <p className="text-xs text-[#8ea4c4] mt-1">
                                {problem.category}
                              </p>
                            </div>
                            <span
                              className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}
                            >
                              {String(
                                problem.difficulty || "easy",
                              ).toUpperCase()}
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-[#2f4463] bg-[#0f1931] px-4 py-10 text-center text-[#90a6c4]">
                        No problems found for "{problemSearch}".
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "history" && (
              <section className="mt-5">
                <div className="rounded-2xl border border-[#2e4262] bg-[#0f1a31]/82 p-6 sm:p-7 shadow-[0_14px_34px_rgba(4,8,18,0.52)]">
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#273a58]/65">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#d7e6ff]">
                        Session History
                      </h2>
                      <p className="mt-1 text-sm text-[#9bb0ce]">
                        Previous interview sessions and recordings.
                      </p>
                    </div>
                    <span className="text-xs tracking-[0.08em] text-[#8db2df]">
                      {recentSessions.length} TOTAL
                    </span>
                  </div>

                  {loadingRecentSessions ? (
                    <div className="px-4 py-14 flex justify-center">
                      <Loader2Icon className="size-7 animate-spin text-[#7fb2ea]" />
                    </div>
                  ) : recentSessions.length === 0 ? (
                    <div className="px-4 py-14 text-center text-[#90a6c4]">
                      No previous sessions yet.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {recentSessions.map((session) => (
                        <div
                          key={session._id}
                          className="rounded-xl border border-[#2f4463] bg-[#0f1931] px-4 py-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#dfebff]">
                                {session.problem}
                              </p>
                              <p className="text-xs text-[#8ea4c4] mt-1">
                                {new Date(session.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}
                              >
                                {String(
                                  session.difficulty || "easy",
                                ).toUpperCase()}
                              </span>
                              {session.callId ? (
                                <Link
                                  to={`/session/${session._id}?mode=playback`}
                                  className="btn btn-sm rounded-lg border-[#46679a] text-[#deebff] bg-[#14284f] hover:bg-[#1a3565]"
                                >
                                  View Recording
                                </Link>
                              ) : (
                                <span className="text-xs text-[#7f95b2]">
                                  Recording unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      <FetchLeetCodeModal
        open={fetchLeetCodeOpen}
        onClose={() => setFetchLeetCodeOpen(false)}
        onQuestionFetched={handleQuestionFetched}
      />

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />
    </>
  );
}

export default DashboardPage;
