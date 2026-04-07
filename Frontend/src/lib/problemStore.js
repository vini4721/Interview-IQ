import { PROBLEMS } from "../data/problems";

const CUSTOM_PROBLEMS_KEY = "interviewiq_custom_problems";

function stripHtml(html = "") {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function normalizeDifficulty(difficulty = "Easy") {
  const value = String(difficulty).toLowerCase();
  if (value === "hard") return "Hard";
  if (value === "medium") return "Medium";
  return "Easy";
}

function ensureStarterCode(starterCode = {}, title = "Solution") {
  return {
    javascript:
      starterCode.javascript ||
      `function solve() {\n  // Write your solution here\n}\n\n// Test cases\nconsole.log(solve());`,
    python:
      starterCode.python ||
      `def solve():\n    # Write your solution here\n    pass\n\n# Test cases\nprint(solve())`,
    java:
      starterCode.java ||
      `class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`,
  };
}

export function normalizeProblem(problem) {
  const slug =
    problem.slug ||
    String(problem.title || "problem")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  const id = `lc-${slug}`;

  const descriptionText =
    typeof problem.description === "string"
      ? stripHtml(problem.description)
      : problem.description?.text || "";

  const notes = Array.isArray(problem.description?.notes)
    ? problem.description.notes
    : [];
  const examples =
    Array.isArray(problem.examples) && problem.examples.length > 0
      ? problem.examples
      : [{ input: "", output: "" }];

  return {
    id,
    source: "leetcode",
    title: problem.title || "LeetCode Question",
    difficulty: normalizeDifficulty(problem.difficulty),
    category: problem.category || "LeetCode",
    description: {
      text: descriptionText,
      notes,
    },
    examples,
    constraints: Array.isArray(problem.constraints) ? problem.constraints : [],
    starterCode: ensureStarterCode(problem.starterCode, problem.title),
    expectedOutput: problem.expectedOutput || {
      javascript: "",
      python: "",
      java: "",
    },
  };
}

export function getCustomProblems() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CUSTOM_PROBLEMS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomProblem(problem) {
  if (typeof window === "undefined") return normalizeProblem(problem);

  const normalized = normalizeProblem(problem);
  const current = getCustomProblems();
  const existingIndex = current.findIndex((item) => item.id === normalized.id);

  if (existingIndex >= 0) {
    current[existingIndex] = normalized;
  } else {
    current.unshift(normalized);
  }

  localStorage.setItem(CUSTOM_PROBLEMS_KEY, JSON.stringify(current));
  return normalized;
}

export function getAllProblemsMap() {
  const custom = getCustomProblems();
  const customMap = Object.fromEntries(
    custom.map((problem) => [problem.id, problem]),
  );
  return { ...PROBLEMS, ...customMap };
}

export function getAllProblemsArray() {
  return Object.values(getAllProblemsMap());
}
