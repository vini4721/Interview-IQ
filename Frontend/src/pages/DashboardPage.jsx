import { useUser } from "@clerk/clerk-react";
import {
  BellIcon,
  ChartNoAxesColumnIcon,
  Clock3Icon,
  Code2Icon,
  Grid3X3Icon,
  Loader2Icon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  useActiveSessions,
  useCreateSession,
  useMyRecentSessions,
} from "../hooks/useSessions";

import CreateSessionModal from "../components/CreateSessionModal";
import ShareMeetingDialog from "../components/ShareMeetingDialog";
import { getDifficultyBadgeClass } from "../lib/utils";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });
  const [shareSessionId, setShareSessionId] = useState(null);

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } =
    useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } =
    useMyRecentSessions();

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          setShareSessionId(data.session._id);
        },
      },
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return (
      session.host?.clerkId === user.id ||
      session.participant?.clerkId === user.id
    );
  };

  const navItems = [
    { label: "Dashboard", icon: Grid3X3Icon, active: true },
    { label: "Editor", icon: Code2Icon, to: "/problems" },
    { label: "Collaborators", icon: UsersIcon },
    { label: "History", icon: Clock3Icon },
    { label: "Analytics", icon: ChartNoAxesColumnIcon },
  ];

  return (
    <>
      <div className="min-h-screen bg-base-300 relative overflow-hidden text-base-content">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-32 left-[10%] h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-[15%] -right-24 h-80 w-80 rounded-full bg-secondary/12 blur-3xl" />
          <div className="absolute bottom-[-12%] left-[35%] h-88 w-88 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
          <aside className="border-r border-base-content/10 bg-base-100/70 backdrop-blur-xl p-4 lg:p-6">
            <div className="flex items-center gap-3 pb-6 border-b border-base-content/10">
              <div className="size-8 rounded-lg bg-primary/20 border border-primary/30" />
              <div>
                <p className="text-sm tracking-wider font-semibold">
                  INTERVIEWIQ
                </p>
                <p className="text-[11px] text-base-content/55">
                  ENGINE v2.0.1
                </p>
              </div>
            </div>

            <p className="mt-5 text-[11px] tracking-[0.22em] text-primary font-semibold">
              SYSTEM HEALTH: OPTIMAL
            </p>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      item.active
                        ? "bg-base-200/80 border-primary/30 text-primary"
                        : "bg-transparent border-transparent text-base-content/70 hover:text-base-content hover:border-base-content/20"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                );

                if (item.to) {
                  return (
                    <Link key={item.label} to={item.to}>
                      {content}
                    </Link>
                  );
                }

                return <div key={item.label}>{content}</div>;
              })}
            </nav>

            <div className="mt-auto pt-12 text-[11px] text-base-content/45 space-y-1">
              <p>ENGINE LATENCY: 12MS</p>
              <p>ACTIVE NODES: 1,420</p>
            </div>
          </aside>

          <main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <div className="flex items-center justify-between gap-4 border-b border-base-content/10 pb-4">
              <div className="hidden md:flex items-center gap-5 text-sm text-base-content/65">
                <span className="text-primary border-b border-primary pb-1">
                  Dashboard
                </span>
                <Link to="/problems" className="hover:text-base-content">
                  Editor
                </Link>
                <span className="hover:text-base-content">History</span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-base-content/15 bg-base-100/70 min-w-55">
                  <SearchIcon className="size-4 text-base-content/45" />
                  <span className="text-xs text-base-content/45">
                    SYSTEM_SEARCH
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm btn-circle">
                  <BellIcon className="size-4" />
                </button>
                <button className="btn btn-ghost btn-sm btn-circle">
                  <SettingsIcon className="size-4" />
                </button>
                <div className="avatar">
                  <div className="w-8 rounded-lg border border-base-content/20">
                    <img
                      src={user?.imageUrl}
                      alt={user?.firstName || "profile"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <section className="pt-7">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Welcome back, {user?.firstName || "there"}!
                  </h1>
                  <p className="mt-3 text-base-content/65 max-w-2xl">
                    Ready for another deep dive? Your engine is primed for the
                    next interview round.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary rounded-xl px-8"
                >
                  CREATE SESSION
                  <SparklesIcon className="size-4" />
                </button>
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="card border border-base-content/10 bg-base-100/80">
                <div className="card-body p-5">
                  <p className="text-[11px] tracking-[0.2em] text-base-content/55">
                    REAL-TIME
                  </p>
                  <p className="text-5xl font-black mt-3">
                    {activeSessions.length}
                  </p>
                  <p className="text-xs text-base-content/55 mt-2">
                    ACTIVE SESSIONS
                  </p>
                </div>
              </div>
              <div className="card border border-base-content/10 bg-base-100/80">
                <div className="card-body p-5">
                  <p className="text-[11px] tracking-[0.2em] text-base-content/55">
                    AGGREGATE
                  </p>
                  <p className="text-5xl font-black mt-3">
                    {recentSessions.length}
                  </p>
                  <p className="text-xs text-base-content/55 mt-2">
                    SESSION COMPLETED
                  </p>
                </div>
              </div>
              <div className="card border border-base-content/10 bg-base-100/80">
                <div className="card-body p-5 flex items-center justify-center text-center">
                  <p className="text-sm text-base-content/60">
                    TELEMETRY STREAM NOMINAL
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
                <h2 className="text-xs tracking-[0.22em] font-semibold text-base-content/75">
                  ONGOING SESSIONS
                </h2>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-base-content/10">
                <div className="grid grid-cols-12 gap-3 px-4 py-3 text-[11px] tracking-[0.16em] text-base-content/55 bg-base-200/60">
                  <div className="col-span-5 md:col-span-4">PROBLEM</div>
                  <div className="hidden md:block md:col-span-2">
                    DIFFICULTY
                  </div>
                  <div className="hidden md:block md:col-span-3">HOST</div>
                  <div className="col-span-3 md:col-span-1 text-right md:text-left">
                    PLAYERS
                  </div>
                  <div className="col-span-4 md:col-span-2 text-right">
                    ACTION
                  </div>
                </div>

                {loadingActiveSessions ? (
                  <div className="px-4 py-14 flex justify-center">
                    <Loader2Icon className="size-7 animate-spin text-primary" />
                  </div>
                ) : activeSessions.length === 0 ? (
                  <div className="px-4 py-14 text-center text-base-content/55">
                    No ongoing sessions right now.
                  </div>
                ) : (
                  activeSessions.map((session) => {
                    const full =
                      session.participant && !isUserInSession(session);
                    return (
                      <div
                        key={session._id}
                        className="grid grid-cols-12 gap-3 items-center px-4 py-4 border-t border-base-content/10"
                      >
                        <div className="col-span-5 md:col-span-4 min-w-0">
                          <p className="font-semibold truncate">
                            {session.problem}
                          </p>
                        </div>
                        <div className="hidden md:block md:col-span-2">
                          <span
                            className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}
                          >
                            {String(session.difficulty || "easy").toUpperCase()}
                          </span>
                        </div>
                        <div className="hidden md:flex md:col-span-3 items-center gap-2 min-w-0">
                          <div className="avatar">
                            <div className="w-6 rounded border border-base-content/20">
                              <img
                                src={session.host?.profileImage}
                                alt={session.host?.name}
                              />
                            </div>
                          </div>
                          <span className="text-sm truncate">
                            {session.host?.name}
                          </span>
                        </div>
                        <div className="col-span-3 md:col-span-1 text-sm font-semibold text-right md:text-left">
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
                              className="btn btn-sm btn-outline rounded-lg"
                            >
                              {isUserInSession(session) ? "REJOIN" : "JOIN"}
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
              <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
                <h2 className="text-xs tracking-[0.22em] font-semibold text-base-content/75">
                  SESSION LOGS
                </h2>
                <span className="text-xs tracking-[0.18em] text-base-content/45">
                  VIEW ARCHIVES
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loadingRecentSessions ? (
                  <div className="col-span-full px-4 py-14 flex justify-center card border border-base-content/10">
                    <Loader2Icon className="size-7 animate-spin text-primary" />
                  </div>
                ) : recentSessions.length === 0 ? (
                  <div className="col-span-full px-4 py-14 text-center text-base-content/55 card border border-base-content/10">
                    No session logs yet.
                  </div>
                ) : (
                  recentSessions.slice(0, 6).map((session) => (
                    <div
                      key={session._id}
                      className="card border border-base-content/10 bg-base-100/80"
                    >
                      <div className="card-body p-5">
                        <div className="flex items-center justify-between text-xs text-base-content/55">
                          <span>
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}
                          >
                            {String(session.difficulty || "easy").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xl font-bold mt-3 truncate">
                          {session.problem}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-base-content/60">
                          <UsersIcon className="size-3.5" />
                          <span>{session.participant ? 2 : 1} player(s)</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />

      <ShareMeetingDialog
        open={Boolean(shareSessionId)}
        sessionId={shareSessionId}
        onClose={() => setShareSessionId(null)}
        headline="Your meeting is ready"
        subtitle="Copy the link and send it to your guest. They need to sign in to join. This room allows up to 2 people."
        showJoinButton
        onJoinMeeting={() => {
          const id = shareSessionId;
          setShareSessionId(null);
          navigate(`/session/${id}`, { state: { openShareMeeting: true } });
        }}
      />
    </>
  );
}

export default DashboardPage;
