import { UserButton } from "@clerk/clerk-react";
import { BookOpenIcon, LayoutDashboardIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

function Navbar({ hideBrand = false }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isSessionPage = location.pathname.startsWith("/session");

  return (
    <nav className="bg-linear-to-r from-base-100 to-base-100 border-b border-base-300/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO - Hidden on session/interview screen */}
        {!isSessionPage && !hideBrand && (
          <Link
            to="/"
            className="group flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-200 shrink-0"
          >
            <img
              src="/interviewiq-logo.svg"
              alt="InterviewIQ logo"
              className="size-9 rounded-lg"
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-base bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                InterviewIQ
              </span>
              <span className="text-xs text-base-content/50 font-medium leading-none">
                Code Together
              </span>
            </div>
          </Link>
        )}

        {/* Spacer or centered logo area for session page */}
        {(isSessionPage || hideBrand) && <div className="flex-1" />}

        {/* Navigation Links */}
        <div className="flex items-center gap-2 ml-auto">
          {/* PROBLEMS PAGE LINK */}
          <Link
            to="/problems"
            className={`px-3.5 py-2 rounded-md transition-all duration-200 flex items-center gap-2 font-medium text-sm ${
              isActive("/problems")
                ? "bg-primary text-primary-content shadow-md"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/60"
            }`}
            title="Problems"
          >
            <BookOpenIcon className="size-4.5" />
            <span className="hidden sm:inline">Problems</span>
          </Link>

          {/* DASHBOARD PAGE LINK */}
          <Link
            to="/dashboard"
            className={`px-3.5 py-2 rounded-md transition-all duration-200 flex items-center gap-2 font-medium text-sm ${
              isActive("/dashboard")
                ? "bg-primary text-primary-content shadow-md"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/60"
            }`}
            title="Dashboard"
          >
            <LayoutDashboardIcon className="size-4.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* USER PROFILE */}
          <div className="ml-2 pl-2 border-l border-base-300/50">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
