import { useUser } from "@clerk/clerk-react";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { Link2Icon, Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation, useNavigate, useParams } from "react-router";

import CodeEditorPanel from "../components/CodeEditorPanel";
import FetchLeetCodeModal from "../components/FetchLeetCodeModal";
import Navbar from "../components/Navbar";
import ShareMeetingDialog from "../components/ShareMeetingDialog";
import TestCaseViewer from "../components/TestCaseViewer";
import VideoCallUI from "../components/VideoCallUI";
import { PROBLEMS } from "../data/problems";
import {
  useEndSession,
  useJoinSession,
  useSessionById,
} from "../hooks/useSessions";
import useStreamClient from "../hooks/useStreamClient";
import { executeCode } from "../lib/piston";
import { getDifficultyBadgeClass } from "../lib/utils";

function SessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useUser();

  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [shareMeetingOpen, setShareMeetingOpen] = useState(false);
  const [fetchLeetCodeOpen, setFetchLeetCodeOpen] = useState(false);
  const [fetchedProblem, setFetchedProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  const {
    data: sessionData,
    isLoading: loadingSession,
    refetch,
  } = useSessionById(id);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } =
    useStreamClient(session, loadingSession, isHost, isParticipant);

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const displayProblem = fetchedProblem || problemData;
  const displayDifficulty =
    fetchedProblem?.difficulty || session?.difficulty || "easy";

  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [
    session,
    user,
    loadingSession,
    isHost,
    isParticipant,
    id,
    joinSessionMutation,
    refetch,
  ]);

  useEffect(() => {
    if (!session || loadingSession) return;
    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  useEffect(() => {
    if (!session || !user || loadingSession || !isHost) return;
    if (!location.state?.openShareMeeting) return;
    setShareMeetingOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [
    session,
    user,
    loadingSession,
    isHost,
    location.state,
    location.pathname,
    navigate,
  ]);

  useEffect(() => {
    if (displayProblem?.starterCode?.[selectedLanguage]) {
      setCode(displayProblem.starterCode[selectedLanguage]);
    } else {
      setCode("");
    }
  }, [displayProblem, selectedLanguage]);

  const normalizeOutput = (output = "") =>
    output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ","),
      )
      .filter((line) => line.length > 0)
      .join("\n");

  const checkIfTestsPassed = (actualOutput, expectedOutput) =>
    normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);

  const parseTestCasesFromOutput = (output) => {
    const lines = output
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    return (displayProblem?.examples || []).map((example, idx) => ({
      input: example.input,
      expected: example.output,
      actual: lines[idx] || "No output",
      passed: checkIfTestsPassed(lines[idx] || "No output", example.output),
      error: null,
    }));
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(displayProblem?.starterCode?.[newLang] || "");
    setTestResults([]);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResults([]);

    const result = await executeCode(selectedLanguage, code);
    setIsRunning(false);

    if (result.success) {
      setTestResults(parseTestCasesFromOutput(result.output || ""));
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
    }
  };

  const handleEndSession = () => {
    if (
      confirm(
        "Are you sure you want to end this session? All participants will be notified.",
      )
    ) {
      endSessionMutation.mutate(id, {
        onSuccess: () => navigate("/dashboard"),
      });
    }
  };

  const handleQuestionFetched = (newProblem) => {
    setFetchedProblem(newProblem);
    setSelectedLanguage("javascript");
    setCode(newProblem.starterCode?.javascript || "");
    setTestResults([]);
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <ShareMeetingDialog
        open={shareMeetingOpen}
        sessionId={id}
        onClose={() => setShareMeetingOpen(false)}
      />

      <FetchLeetCodeModal
        open={fetchLeetCodeOpen}
        onClose={() => setFetchLeetCodeOpen(false)}
        onQuestionFetched={handleQuestionFetched}
      />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200">
                  <div className="p-6 bg-base-100 border-b border-base-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-base-content">
                          {fetchedProblem?.title ||
                            session?.problem ||
                            "Loading..."}
                        </h1>
                        {displayProblem?.category && (
                          <p className="text-base-content/60 mt-1">
                            {displayProblem.category}
                          </p>
                        )}
                        <p className="text-base-content/60 mt-2">
                          Host: {session?.host?.name || "Loading..."} •{" "}
                          {session?.participant ? 2 : 1}/2 participants
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`badge badge-lg ${getDifficultyBadgeClass(displayDifficulty)}`}
                        >
                          {(displayDifficulty?.slice(0, 1).toUpperCase() ||
                            "E") + (displayDifficulty?.slice(1) || "asy")}
                        </span>

                        {isHost && session?.status === "active" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShareMeetingOpen(true)}
                              className="btn btn-outline btn-primary btn-sm gap-2"
                              title="Share a join link like Google Meet"
                            >
                              <Link2Icon className="w-4 h-4" />
                              Share meeting
                            </button>
                            <button
                              type="button"
                              onClick={() => setFetchLeetCodeOpen(true)}
                              className="btn btn-outline btn-accent btn-sm gap-2"
                              title="Fetch a question from LeetCode"
                            >
                              📝 Fetch Question
                            </button>
                            <button
                              type="button"
                              onClick={handleEndSession}
                              disabled={endSessionMutation.isPending}
                              className="btn btn-error btn-sm gap-2"
                            >
                              {endSessionMutation.isPending ? (
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                              ) : (
                                <LogOutIcon className="w-4 h-4" />
                              )}
                              End Session
                            </button>
                          </>
                        )}

                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {displayProblem?.description && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">
                          Description
                        </h2>
                        <div className="space-y-3 text-base leading-relaxed">
                          <p className="text-base-content/90">
                            {displayProblem.description.text ||
                              displayProblem.description}
                          </p>
                          {displayProblem.description.notes?.map(
                            (note, idx) => (
                              <p key={idx} className="text-base-content/90">
                                {note}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {displayProblem?.examples?.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">
                          Examples
                        </h2>
                        <div className="space-y-4">
                          {displayProblem.examples.map((example, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-sm">
                                  {idx + 1}
                                </span>
                                <p className="font-semibold text-base-content">
                                  Example {idx + 1}
                                </p>
                              </div>
                              <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                <div className="flex gap-2">
                                  <span className="text-primary font-bold min-w-20">
                                    Input:
                                  </span>
                                  <span>{example.input}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-secondary font-bold min-w-20">
                                    Output:
                                  </span>
                                  <span>{example.output}</span>
                                </div>
                                {example.explanation && (
                                  <div className="pt-2 border-t border-base-300 mt-2">
                                    <span className="text-base-content/60 font-sans text-xs">
                                      <span className="font-semibold">
                                        Explanation:
                                      </span>{" "}
                                      {example.explanation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {displayProblem?.constraints?.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">
                          Constraints
                        </h2>
                        <ul className="space-y-2 text-base-content/90">
                          {displayProblem.constraints.map((constraint, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <code className="text-sm">{constraint}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
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

                  <Panel defaultSize={30} minSize={15}>
                    <TestCaseViewer
                      testResults={testResults}
                      isRunning={isRunning}
                    />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">
                        Unable to connect to the video call
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
