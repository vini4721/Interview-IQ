import { useState } from "react";
import { Link, useParams } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import {
  SparklesIcon,
  PlayIcon,
  RotateCcwIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ZapIcon,
} from "lucide-react";

const PROBLEMS = {
  1: {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" },
      { input: "nums = [3,3], target = 6", output: "[0,1]", explanation: "" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
  
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`,
    },
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" },
    ],
  },
  2: {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    tags: ["String", "Two Pointers"],
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "" },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: "" },
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    starterCode: {
      javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
  // Your solution here
  
};`,
      python: `class Solution:
    def reverseString(self, s: List[str]) -> None:
        pass`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Your solution here
    }
}`,
    },
    testCases: [
      { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' },
    ],
  },
};

// Fallback for problem IDs not in the map
const defaultProblem = (id) => ({
  id,
  title: `Problem #${id}`,
  difficulty: "Medium",
  tags: ["Algorithm"],
  description: "Problem description coming soon...",
  examples: [],
  constraints: [],
  starterCode: { javascript: "// Your solution here\n", python: "# Your solution here\n", java: "// Your solution here\n" },
  testCases: [],
});

const difficultyColor = (d) => {
  if (d === "Easy") return "badge-success";
  if (d === "Medium") return "badge-warning";
  return "badge-error";
};

const LANGUAGES = ["javascript", "python", "java"];

export default function ProblemPage() {
  const { id } = useParams();
  const problem = PROBLEMS[Number(id)] || defaultProblem(id);
  const [selectedLang, setSelectedLang] = useState("javascript");
  const [code, setCode] = useState(problem.starterCode[selectedLang] || "");
  const [activeTab, setActiveTab] = useState("description");
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setCode(problem.starterCode[lang] || "");
    setRunResult(null);
  };

  const handleRun = () => {
    setIsRunning(true);
    setRunResult(null);
    setTimeout(() => {
      const passed = Math.random() > 0.4;
      setRunResult({
        passed,
        cases: problem.testCases.map((tc, i) => ({
          ...tc,
          status: i === 0 ? passed : Math.random() > 0.3,
          runtime: `${Math.floor(Math.random() * 50 + 5)}ms`,
        })),
      });
      setIsRunning(false);
    }, 1500);
  };

  const handleReset = () => {
    setCode(problem.starterCode[selectedLang] || "");
    setRunResult(null);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-base-100/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
              <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow">
                <SparklesIcon className="size-4 text-primary-content" />
              </div>
              <span className="font-black text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-mono tracking-wider hidden sm:block">
                Talent IQ
              </span>
            </Link>

            <div className="flex items-center gap-1 text-base-content/40 text-sm">
              <ChevronRightIcon className="size-4" />
              <Link to="/problems" className="hover:text-primary transition-colors">Problems</Link>
              <ChevronRightIcon className="size-4" />
              <span className="text-base-content font-semibold truncate max-w-40">{problem.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="btn btn-primary btn-sm gap-2"
            >
              {isRunning ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <PlayIcon className="size-4" />
              )}
              {isRunning ? "Running..." : "Run Code"}
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* MAIN SPLIT VIEW */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        {/* LEFT PANEL - Problem Info */}
        <div className="w-full lg:w-[42%] bg-base-100 border-r border-base-300 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="tabs tabs-border border-b border-base-300 px-4 pt-2 shrink-0">
            <button
              onClick={() => setActiveTab("description")}
              className={`tab font-semibold ${activeTab === "description" ? "tab-active" : ""}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("examples")}
              className={`tab font-semibold ${activeTab === "examples" ? "tab-active" : ""}`}
            >
              Examples
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Problem Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm text-base-content/40">#{problem.id}</span>
                <h1 className="text-xl font-black text-base-content">{problem.title}</h1>
                <span className={`badge ${difficultyColor(problem.difficulty)} font-semibold`}>
                  {problem.difficulty}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {problem.tags.map((t) => (
                  <span key={t} className="badge badge-outline badge-sm">{t}</span>
                ))}
              </div>
            </div>

            {activeTab === "description" && (
              <>
                {/* Description */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-base-content/80 whitespace-pre-line leading-relaxed">{problem.description}</p>
                </div>

                {/* Examples */}
                {problem.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-base-content/70 uppercase tracking-wider">Examples</h3>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="bg-base-200 rounded-xl p-4 border border-base-300 space-y-2">
                        <div>
                          <span className="text-xs font-bold text-base-content/50 uppercase">Input: </span>
                          <code className="text-sm font-mono">{ex.input}</code>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-base-content/50 uppercase">Output: </span>
                          <code className="text-sm font-mono text-success">{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div>
                            <span className="text-xs font-bold text-base-content/50 uppercase">Explanation: </span>
                            <span className="text-sm text-base-content/70">{ex.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-base-content/70 uppercase tracking-wider">Constraints</h3>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-base-content/70">
                          <span className="text-primary mt-0.5">•</span>
                          <code className="font-mono text-xs bg-base-200 px-1.5 py-0.5 rounded">{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === "examples" && (
              <div className="space-y-4">
                {problem.testCases.map((tc, i) => (
                  <div key={i} className="bg-base-200 rounded-xl p-4 border border-base-300 space-y-2">
                    <p className="text-xs font-bold text-base-content/50 uppercase">Test Case {i + 1}</p>
                    <div>
                      <span className="text-xs text-base-content/50">Input: </span>
                      <code className="text-sm font-mono">{tc.input}</code>
                    </div>
                    <div>
                      <span className="text-xs text-base-content/50">Expected: </span>
                      <code className="text-sm font-mono text-success">{tc.expected}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="bg-base-100 border-b border-base-300 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangChange(lang)}
                  className={`btn btn-xs rounded-full font-mono ${selectedLang === lang ? "btn-primary" : "btn-ghost"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="btn btn-ghost btn-xs gap-1 text-base-content/50"
            >
              <RotateCcwIcon className="size-3" />
              Reset
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden relative">
            <textarea
              className="w-full h-full bg-[#1e1e2e] text-[#cdd6f4] font-mono text-sm p-5 resize-none outline-none leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
            />
          </div>

          {/* Test Cases / Output */}
          <div className="bg-base-100 border-t border-base-300 overflow-y-auto" style={{ maxHeight: "220px" }}>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-base-content">Test Results</h3>
                {runResult && (
                  <span className={`badge ${runResult.passed ? "badge-success" : "badge-error"} font-semibold`}>
                    {runResult.passed ? "All Passed" : "Some Failed"}
                  </span>
                )}
              </div>

              {!runResult && !isRunning && (
                <div className="flex items-center gap-2 text-base-content/40 text-sm py-4">
                  <PlayIcon className="size-4" />
                  <span>Run your code to see results</span>
                </div>
              )}

              {isRunning && (
                <div className="flex items-center gap-3 text-base-content/60 text-sm py-4">
                  <span className="loading loading-dots loading-sm text-primary" />
                  Executing test cases...
                </div>
              )}

              {runResult && (
                <div className="space-y-2">
                  {runResult.cases.map((tc, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                        tc.status
                          ? "bg-success/5 border-success/20"
                          : "bg-error/5 border-error/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {tc.status ? (
                          <CheckCircleIcon className="size-4 text-success" />
                        ) : (
                          <XCircleIcon className="size-4 text-error" />
                        )}
                        <span className="font-mono text-xs text-base-content/70">Case {i + 1}: {tc.input}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-base-content/50">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="size-3" /> {tc.runtime}
                        </span>
                        <span className={tc.status ? "text-success" : "text-error"}>
                          {tc.status ? "Accepted" : "Wrong Answer"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
