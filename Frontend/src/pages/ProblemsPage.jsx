import { useMemo, useState } from "react";
import { Link } from "react-router";
import FetchLeetCodeModal from "../components/FetchLeetCodeModal";
import Navbar from "../components/Navbar";

import { ChevronRightIcon, Code2Icon, SearchIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";
import { getCustomProblems, saveCustomProblem } from "../lib/problemStore";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const [fetchLeetCodeOpen, setFetchLeetCodeOpen] = useState(false);
  const [fetchedQuestion, setFetchedQuestion] = useState(null);
  const [customProblems, setCustomProblems] = useState(() =>
    getCustomProblems(),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const allProblems = useMemo(
    () => [...customProblems, ...Object.values(PROBLEMS)],
    [customProblems],
  );

  const problems = useMemo(() => {
    if (!searchQuery.trim()) return allProblems;

    const query = searchQuery.toLowerCase();
    return allProblems.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.difficulty.toLowerCase().includes(query),
    );
  }, [allProblems, searchQuery]);

  const handleQuestionFetched = (question) => {
    const savedProblem = saveCustomProblem(question);
    setCustomProblems(getCustomProblems());
    setFetchedQuestion(savedProblem);
  };

  const easyProblemsCount = allProblems.filter(
    (p) => p.difficulty === "Easy",
  ).length;
  const mediumProblemsCount = allProblems.filter(
    (p) => p.difficulty === "Medium",
  ).length;
  const hardProblemsCount = allProblems.filter(
    (p) => p.difficulty === "Hard",
  ).length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <FetchLeetCodeModal
        open={fetchLeetCodeOpen}
        onClose={() => setFetchLeetCodeOpen(false)}
        onQuestionFetched={handleQuestionFetched}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
            <p className="text-base-content/70">
              Sharpen your coding skills with these curated problems
            </p>
          </div>

          <div className="flex flex-col gap-3 self-start lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="form-control flex-1 lg:flex-none">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full lg:w-64"
                />
                <button className="btn btn-ghost">
                  <SearchIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* Fetch LeetCode Button */}
            <button
              type="button"
              onClick={() => setFetchLeetCodeOpen(true)}
              className="btn btn-outline btn-primary gap-2"
            >
              <SearchIcon className="size-4" />
              Fetch from LeetCode
            </button>
          </div>
        </div>

        {fetchedQuestion && (
          <div className="mb-8 card bg-base-100 shadow-lg border border-primary/20">
            <div className="card-body">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="card-title text-2xl">{fetchedQuestion.title}</h2>
                <span className="badge badge-primary">LeetCode</span>
                <span className="badge badge-outline capitalize">
                  {fetchedQuestion.difficulty}
                </span>
              </div>
              {fetchedQuestion.category && (
                <p className="text-sm text-base-content/60">
                  {fetchedQuestion.category}
                </p>
              )}
              <p className="text-base-content/80 mt-3 line-clamp-4">
                {typeof fetchedQuestion.description === "string"
                  ? fetchedQuestion.description.replace(/<[^>]+>/g, "")
                  : fetchedQuestion.description?.text ||
                    "Fetched question ready to use."}
              </p>
            </div>
          </div>
        )}

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {problems.length > 0 ? (
            problems.map((problem) => (
              <Link
                key={problem.id}
                to={`/problem/${problem.id}`}
                className="card bg-base-100 hover:scale-[1.01] transition-transform cursor-pointer"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between gap-4">
                    {/* LEFT SIDE */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Code2Icon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold">
                              {problem.title}
                            </h2>
                            <span
                              className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}
                            >
                              {problem.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-base-content/60">
                            {" "}
                            {problem.category}
                          </p>
                        </div>
                      </div>
                      <p className="text-base-content/80 mb-3">
                        {problem.description.text}
                      </p>
                    </div>
                    {/* RIGHT SIDE */}

                    <div className="flex items-center gap-2 text-primary">
                      <span className="font-medium">Solve</span>
                      <ChevronRightIcon className="size-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="card bg-base-100 shadow-lg border-2 border-dashed border-base-300">
              <div className="card-body items-center justify-center text-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  No problems found
                </h3>
                <p className="text-base-content/60 mb-4">
                  Try adjusting your search terms or fetch a new problem from
                  LeetCode
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="btn btn-sm btn-ghost"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">
                  {searchQuery ? "Found" : "Total"} Problems
                </div>
                <div className="stat-value text-primary">{problems.length}</div>
                {searchQuery && (
                  <div className="stat-desc text-base-content/60">
                    out of {allProblems.length}
                  </div>
                )}
              </div>

              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">
                  {easyProblemsCount}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">
                  {mediumProblemsCount}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;
