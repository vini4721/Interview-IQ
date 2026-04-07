import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, SparklesIcon, ZapIcon } from "lucide-react";

function WelcomeSection({
  onCreateSession,
  activeSessionsCount,
  recentSessionsCount,
}) {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="card bg-base-100/85 border border-base-content/10 shadow-xl backdrop-blur-sm">
          <div className="card-body p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-md">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-base-content/60">
                    InterviewIQ Workspace
                  </p>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Welcome back, {user?.firstName || "there"}!
                </h1>

                <p className="mt-4 text-base sm:text-lg text-base-content/70 max-w-2xl">
                  Build momentum with real-time interview sessions, collaborate
                  live, and track your recent progress in one place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="badge badge-lg badge-outline">
                    {activeSessionsCount} Live now
                  </div>
                  <div className="badge badge-lg badge-outline">
                    {recentSessionsCount} Sessions done
                  </div>
                </div>
              </div>

              <button
                onClick={onCreateSession}
                className="group btn btn-primary btn-lg gap-3 rounded-2xl shadow-lg shadow-primary/20"
              >
                <ZapIcon className="w-5 h-5" />
                <span>Create Session</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
