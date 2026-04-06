import { useState } from "react";
import { Link } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import {
  SparklesIcon,
  SearchIcon,
  CheckCircleIcon,
  CircleIcon,
  FilterIcon,
  CodeIcon,
} from "lucide-react";

const PROBLEMS = [
  { id: 1, title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"], solved: true },
  { id: 2, title: "Reverse String", difficulty: "Easy", tags: ["String", "Two Pointers"], solved: false },
  { id: 3, title: "Valid Palindrome", difficulty: "Easy", tags: ["String"], solved: false },
  { id: 4, title: "Valid Parentheses", difficulty: "Easy", tags: ["Stack"], solved: false },
  { id: 5, title: "Merge Two Sorted Lists", difficulty: "Easy", tags: ["Linked List"], solved: true },
  { id: 6, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", tags: ["Array", "DP"], solved: false },
  { id: 7, title: "Binary Search", difficulty: "Easy", tags: ["Binary Search"], solved: true },
  { id: 8, title: "Climbing Stairs", difficulty: "Easy", tags: ["DP", "Math"], solved: false },
  { id: 9, title: "Add Two Numbers", difficulty: "Medium", tags: ["Linked List", "Math"], solved: false },
  { id: 10, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", tags: ["String", "Sliding Window"], solved: false },
  { id: 11, title: "3Sum", difficulty: "Medium", tags: ["Array", "Two Pointers"], solved: false },
  { id: 12, title: "Coin Change", difficulty: "Medium", tags: ["DP", "BFS"], solved: false },
  { id: 13, title: "Number of Islands", difficulty: "Medium", tags: ["DFS", "BFS", "Graph"], solved: false },
  { id: 14, title: "Word Search", difficulty: "Medium", tags: ["Backtracking", "DFS"], solved: false },
  { id: 15, title: "Rotate Image", difficulty: "Medium", tags: ["Array", "Math"], solved: false },
  { id: 16, title: "Trapping Rain Water", difficulty: "Hard", tags: ["Array", "Two Pointers", "DP"], solved: false },
  { id: 17, title: "Merge k Sorted Lists", difficulty: "Hard", tags: ["Linked List", "Heap"], solved: false },
  { id: 18, title: "Longest Valid Parentheses", difficulty: "Hard", tags: ["Stack", "DP"], solved: false },
];

const difficultyColor = (d) => {
  if (d === "Easy") return "badge-success";
  if (d === "Medium") return "badge-warning";
  return "badge-error";
};

const DIFFICULTY_FILTERS = ["All", "Easy", "Medium", "Hard"];

export default function ProblemsPage() {
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = PROBLEMS.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "All" || p.difficulty === diffFilter;
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Solved" && p.solved) ||
      (statusFilter === "Unsolved" && !p.solved);
    return matchSearch && matchDiff && matchStatus;
  });

  const solved = PROBLEMS.filter((p) => p.solved).length;

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
              <Link to="/dashboard" className="tab font-semibold">Dashboard</Link>
              <Link to="/problems" className="tab tab-active font-semibold">Problems</Link>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-base-content">Practice Problems</h1>
            <p className="text-base-content/60 mt-1">
              <span className="text-success font-bold">{solved}</span>/{PROBLEMS.length} solved
            </p>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-3 bg-base-100 rounded-2xl px-5 py-3 shadow border border-base-300">
            <div className="radial-progress text-primary text-xs font-bold" style={{ "--value": Math.round((solved / PROBLEMS.length) * 100), "--size": "3.5rem", "--thickness": "4px" }}>
              {Math.round((solved / PROBLEMS.length) * 100)}%
            </div>
            <div>
              <p className="font-bold text-sm">Progress</p>
              <p className="text-xs text-base-content/50">Keep it up!</p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body py-4">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Search */}
              <label className="input input-bordered flex items-center gap-2 flex-1">
                <SearchIcon className="size-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search problems or tags..."
                  className="grow"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <FilterIcon className="size-4 text-base-content/40" />
                {DIFFICULTY_FILTERS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className={`btn btn-sm rounded-full ${diffFilter === d ? "btn-primary" : "btn-ghost"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                className="select select-bordered select-sm w-full md:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROBLEMS TABLE */}
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="text-base-content/60 font-semibold text-xs uppercase tracking-wider w-12">Status</th>
                  <th className="text-base-content/60 font-semibold text-xs uppercase tracking-wider">#</th>
                  <th className="text-base-content/60 font-semibold text-xs uppercase tracking-wider">Title</th>
                  <th className="text-base-content/60 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Tags</th>
                  <th className="text-base-content/60 font-semibold text-xs uppercase tracking-wider">Difficulty</th>
                  <th className="text-base-content/60 font-semibold text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((problem) => (
                  <tr key={problem.id} className="hover:bg-base-200/50 transition-colors group">
                    <td>
                      {problem.solved ? (
                        <CheckCircleIcon className="size-5 text-success" />
                      ) : (
                        <CircleIcon className="size-5 text-base-content/20" />
                      )}
                    </td>
                    <td className="font-mono text-sm text-base-content/50">{problem.id}</td>
                    <td>
                      <Link
                        to={`/problem/${problem.id}`}
                        className="font-semibold text-base-content hover:text-primary transition-colors group-hover:text-primary"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.map((t) => (
                          <span key={t} className="badge badge-ghost badge-xs">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${difficultyColor(problem.difficulty)} badge-sm font-semibold`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <Link to={`/problem/${problem.id}`} className="btn btn-xs btn-outline btn-primary gap-1">
                        <CodeIcon className="size-3" />
                        Solve
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-base-content/40">
                      No problems match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
