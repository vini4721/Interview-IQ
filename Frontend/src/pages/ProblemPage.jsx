import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "../components/Navbar";
import { getAllProblemsMap } from "../lib/problemStore";

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
  const [problemsMap, setProblemsMap] = useState(() => getAllProblemsMap());

  const defaultProblemId = "two-sum";
  const initialProblemId = id && problemsMap[id] ? id : defaultProblemId;

  const [currentProblemId, setCurrentProblemId] = useState(initialProblemId);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(
    (problemsMap[initialProblemId] || problemsMap[defaultProblemId]).starterCode
      .javascript,
  );
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const currentProblem =
    problemsMap[currentProblemId] || problemsMap[defaultProblemId];

  // update problem when URL param changes
  useEffect(() => {
    const map = getAllProblemsMap();
    setProblemsMap(map);

    if (id && map[id]) {
      setCurrentProblemId(id);
      setCode(map[id].starterCode[selectedLanguage] || "");
      setTestResults([]);
      return;
    }

    setCurrentProblemId(defaultProblemId);
    setCode(map[defaultProblemId].starterCode[selectedLanguage] || "");
    setTestResults([]);
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
    // Normalize output for comparison across all languages
    return output
      .trim()
      .split("\n")
      .map((line) => {
        line = line.trim();
        // Normalize array formats: [0, 1], [0,1], [0 , 1] all become [0,1]
        line = line.replace(/\[\s*/g, "[").replace(/\s*\]/g, "]");
        line = line.replace(/,\s+/g, ",");
        // Remove trailing commas or spaces before closing bracket
        line = line.replace(/,\s*\]/g, "]");
        // Handle Python list format: ['a', 'b'] -> clean it up
        line = line.replace(/'/g, '"');
        return line;
      })
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

    // Auto-inject test cases if code looks incomplete
    let codeToExecute = code;
    const codeLines = code.trim().split("\n").length;
    const hasTestInvocations =
      code.includes("console.log") ||
      code.includes("print(") ||
      code.includes("System.out.println");

    // If code is short (probably just a function stub) and no test invocations, inject testCode
    if (
      codeLines < 15 &&
      !hasTestInvocations &&
      currentProblem.testCode?.[selectedLanguage]
    ) {
      codeToExecute = code + "\n\n" + currentProblem.testCode[selectedLanguage];
    }

    const result = await executeCode(selectedLanguage, codeToExecute);
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
      <Navbar hideBrand />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={Object.values(problemsMap)}
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
