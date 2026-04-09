import { Check, Clock, X } from "lucide-react";

export default function TestCaseViewer({ testResults, isRunning }) {
  if (testResults.length === 0) {
    return (
      <div className="h-full bg-base-100 flex flex-col">
        <div className="px-4 py-2 bg-base-200 border-b border-base-300 font-semibold text-sm">
          Test Results
        </div>
        <div className="flex-1 overflow-auto p-4">
          <p className="text-base-content/50 text-sm">
            Click "Run Code" to see test results here...
          </p>
        </div>
      </div>
    );
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="h-full bg-base-100 flex flex-col">
      <div className="px-4 py-3 bg-base-200 border-b border-base-300">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm">Test Results</span>
          {isRunning ? (
            <span className="flex items-center gap-1 text-xs text-warning">
              <Clock className="w-4 h-4 animate-spin" />
              Running...
            </span>
          ) : (
            <span
              className={`text-xs font-bold ${
                allPassed
                  ? "text-success"
                  : passedCount > 0
                    ? "text-warning"
                    : "text-error"
              }`}
            >
              {passedCount}/{totalCount} Passed
            </span>
          )}
        </div>
        <div className="w-full bg-base-300 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              allPassed ? "bg-success" : "bg-error"
            }`}
            style={{ width: `${(passedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {testResults.map((test, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-3 ${
              test.passed
                ? "bg-success/10 border-success/30"
                : "bg-error/10 border-error/30"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Test Case {idx + 1}</span>
              {test.passed ? (
                <span className="flex items-center gap-1 text-success text-xs font-bold">
                  <Check className="w-4 h-4" />
                  Passed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-error text-xs font-bold">
                  <X className="w-4 h-4" />
                  Failed
                </span>
              )}
            </div>

            {/* Input */}
            <div className="mb-2">
              <p className="text-xs text-base-content/60 font-semibold mb-1">
                Input:
              </p>
              <p className="text-xs font-mono bg-base-200 p-2 rounded text-base-content/80">
                {test.input}
              </p>
            </div>

            {/* Expected Output */}
            <div className="mb-2">
              <p className="text-xs text-base-content/60 font-semibold mb-1">
                Expected:
              </p>
              <p className="text-xs font-mono bg-base-200 p-2 rounded text-base-content/80">
                {test.expected}
              </p>
            </div>

            {/* Actual Output */}
            <div>
              <p className="text-xs text-base-content/60 font-semibold mb-1">
                Actual Output:
              </p>
              <p
                className={`text-xs font-mono bg-base-200 p-2 rounded ${test.passed ? "text-success" : "text-error"}`}
              >
                {test.actual || "No output"}
              </p>
            </div>

            {/* Error message if any */}
            {test.error && (
              <div className="mt-2 pt-2 border-t border-error/20">
                <p className="text-xs text-error font-mono bg-error/5 p-2 rounded">
                  {test.error}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
