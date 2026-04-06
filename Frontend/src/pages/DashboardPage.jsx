import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";
import {
  ZapIcon,
  SparklesIcon,
  PlusIcon,
  ActivityIcon,
  LayersIcon,
  ChevronRightIcon,
  XIcon,
  ClockIcon,
  UsersIcon,
  CodeIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const PROBLEMS = [
  { id: 1, title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"] },
  { id: 2, title: "Reverse String", difficulty: "Easy", tags: ["String", "Two Pointers"] },
  { id: 3, title: "Valid Palindrome", difficulty: "Easy", tags: ["String"] },
  { id: 4, title: "Valid Parentheses", difficulty: "Easy", tags: ["Stack"] },
  { id: 5, title: "Merge Two Sorted Lists", difficulty: "Easy", tags: ["Linked List"] },
  { id: 6, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", tags: ["Array", "DP"] },
  { id: 7, title: "Binary Search", difficulty: "Easy", tags: ["Binary Search"] },
  { id: 8, title: "Climbing Stairs", difficulty: "Easy", tags: ["DP", "Math"] },
  { id: 9, title: "Add Two Numbers", difficulty: "Medium", tags: ["Linked List", "Math"] },
  { id: 10, title: "Longest Substring Without Repeating", difficulty: "Medium", tags: ["String", "Sliding Window"] },
  { id: 11, title: "3Sum", difficulty: "Medium", tags: ["Array", "Two Pointers"] },
  { id: 12, title: "Coin Change", difficulty: "Medium", tags: ["DP", "BFS"] },
];

const difficultyColor = (d) => {
  if (d === "Easy") return "badge-success";
  if (d === "Medium") return "badge-warning";
  return "badge-error";
};

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);

  // Simulate fetching sessions from backend - in real app use API
  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/sessions", { credentials: "include" });
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });

  const handleCreateRoom = () => {
    toast.success(`Session created for "${selectedProblem.title}"!`);
    setShowModal(false);
    // Navigate to a mock session
    navigate(`/session/demo-${Date.now()}`);
  };

  const firstName = user?.firstName || user?.username || "Coder";

  return (
    <div className="min-h-screen bg-base-200">
      {/* NAVBAR */}
      <nav className="bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow">
              <SparklesIcon className="size-5 text-primary-content" />
            </div>
            <span className="font-black text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-mono tracking-wider">
              Talent IQ
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="tabs tabs-border hidden md:flex">
              <Link to="/dashboard" className="tab tab-active font-semibold">Dashboard</Link>
              <Link to="/problems" className="tab font-semibold">Problems</Link>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-base-content">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {firstName}!
              </span>
            </h1>
            <p className="text-base-content/60 mt-1 text-base">Ready to level up your coding skills?</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <ZapIcon className="size-5" />
            Create New Session
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 font-medium">Active Sessions</p>
                  <p className="text-4xl font-black text-primary mt-1">
                    {sessions.filter((s) => s.active).length}
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <ActivityIcon className="size-7 text-primary" />
                </div>
              </div>
              <div className="badge badge-ghost mt-2 text-xs">Live right now</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 font-medium">Total Sessions</p>
                  <p className="text-4xl font-black text-secondary mt-1">{sessions.length}</p>
                </div>
                <div className="bg-secondary/10 p-4 rounded-2xl">
                  <LayersIcon className="size-7 text-secondary" />
                </div>
              </div>
              <div className="badge badge-ghost mt-2 text-xs">All time</div>
            </div>
          </div>

          {/* CREATE SESSION CARD */}
          <div
            className="card bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setShowModal(true)}
          >
            <div className="card-body items-center justify-center text-center gap-3">
              <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary/20 transition-colors">
                <PlusIcon className="size-8 text-primary" />
              </div>
              <div>
                <p className="font-bold text-base-content">Create New Session</p>
                <p className="text-xs text-base-content/50 mt-0.5">Start a 1-on-1 coding interview</p>
              </div>
              <ChevronRightIcon className="size-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* RECENT SESSIONS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-base-content">Recent Sessions</h2>
            <Link to="/problems" className="btn btn-ghost btn-sm text-primary gap-1">
              Browse Problems <ChevronRightIcon className="size-4" />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body items-center text-center py-16 gap-4">
                <div className="bg-base-200 p-5 rounded-3xl">
                  <CodeIcon className="size-10 text-base-content/30" />
                </div>
                <div>
                  <p className="font-bold text-base-content/70 text-lg">No sessions yet</p>
                  <p className="text-base-content/40 text-sm mt-1">
                    Create your first coding session to get started!
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary btn-sm gap-2 mt-2"
                >
                  <PlusIcon className="size-4" />
                  Create Session
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="card-body py-4 flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <CodeIcon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base-content">{session.problem}</p>
                      <p className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                        <ClockIcon className="size-3" /> {session.createdAt}
                      </p>
                    </div>
                    <Link to={`/session/${session.id}`} className="btn btn-sm btn-outline btn-primary">
                      Join
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE SESSION MODAL */}
      {showModal && (
        <div className="modal modal-open modal-middle">
          <div className="modal-box max-w-md shadow-2xl border border-base-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <ZapIcon className="size-5 text-primary" />
                </div>
                <h3 className="font-bold text-xl">Create Session</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Select Problem</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedProblem.id}
                  onChange={(e) =>
                    setSelectedProblem(
                      PROBLEMS.find((p) => p.id === Number(e.target.value))
                    )
                  }
                >
                  {PROBLEMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              {/* ROOM SUMMARY */}
              <div className="bg-base-200 rounded-2xl p-4 space-y-3 border border-base-300">
                <p className="font-semibold text-sm text-base-content/70">Room Summary</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base-content">{selectedProblem.title}</span>
                  <span className={`badge ${difficultyColor(selectedProblem.difficulty)} badge-sm font-semibold`}>
                    {selectedProblem.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedProblem.tags.map((t) => (
                    <span key={t} className="badge badge-outline badge-xs">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-base-content/60 pt-1">
                  <UsersIcon className="size-4 text-primary" />
                  <span>Max Participants: <strong className="text-base-content">2</strong> (1-on-1 session)</span>
                </div>
              </div>
            </div>

            <div className="modal-action mt-6">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleCreateRoom} className="btn btn-primary gap-2 shadow-lg">
                <ZapIcon className="size-4" />
                Create Room
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
