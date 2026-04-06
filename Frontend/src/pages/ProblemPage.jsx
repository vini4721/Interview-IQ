import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "../components/Navbar";
import { PROBLEMS } from "../data/problems";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import CodeEditorPanel from "../components/CodeEditorPanel";
import ProblemDescription from "../components/ProblemDescription";
import TestCaseViewer from "../components/TestCaseViewer";
import { executeCode } from "../lib/piston";

import confetti from "canvas-confetti";
import toast from "react-hot-toast";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentProblemId, setCurrentProblemId] = useState("two-sum");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(
    PROBLEMS[currentProblemId].starterCode.javascript,
  );
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const currentProblem = PROBLEMS[currentProblemId];

  // update problem when URL param changes
  useEffect(() => {
    if (id && PROBLEMS[id]) {
      setCurrentProblemId(id);
      setCode(PROBLEMS[id].starterCode[selectedLanguage]);
      setTestResults([]);
    }
  }, [id, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setTestResults([]);
  };

  const handleProblemChange = (newProblemId) =>
    navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const normalizeOutput = (output) => {
    // normalize output for comparison (trim whitespace, handle different spacing)
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          // remove spaces after [ and before ]
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          // normalize spaces around commas to single space after comma
          .replace(/\s*,\s*/g, ","),
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const parseTestCasesFromOutput = (output) => {
    // Split output by lines and create test cases
    const lines = output
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const tests = [];

    currentProblem.examples.forEach((example, idx) => {
      tests.push({
        input: example.input,
        expected: example.output,
        actual: lines[idx] || "No output",
        passed: checkIfTestsPassed(lines[idx] || "No output", example.output),
        error: null,
      });
    });

    return tests;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResults([]);

    const result = await executeCode(selectedLanguage, code);
    setIsRunning(false);

    if (result.success) {
      // Parse individual test cases from output
      const tests = parseTestCasesFromOutput(result.output);
      setTestResults(tests);

      const allPassed = tests.every((t) => t.passed);

      if (allPassed) {
        triggerConfetti();
        toast.success("All tests passed! Great job!");
      } else {
        toast.error("Some tests failed. Check your output!");
      }
    } else {
      setTestResults([
        {
          input: "N/A",
          expected: "N/A",
          actual: "Error",
          passed: false,
          error: result.error,
        },
      ]);
      toast.error("Code execution failed!");
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={Object.values(PROBLEMS)}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Test Case Viewer*/}

              <Panel defaultSize={30} minSize={30}>
                <TestCaseViewer
                  testResults={testResults}
                  isRunning={isRunning}
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
