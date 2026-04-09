import { SignInButton, useUser } from "@clerk/clerk-react";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { Link2Icon, Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  useUpdateSessionQuestion,
} from "../hooks/useSessions";
import useStreamClient from "../hooks/useStreamClient";
import { executeCode } from "../lib/piston";
import { getDifficultyBadgeClass } from "../lib/utils";

const isStructuralHeadingLine = (text = "") => {
  const normalized = String(text)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    /^examples?\s*:?$/i.test(normalized) ||
    /^examples?\s+\d+\s*:?$/i.test(normalized) ||
    /^constraints\s*:?$/i.test(normalized)
  );
};

function SessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useUser();

  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [shareMeetingOpen, setShareMeetingOpen] = useState(false);
  const [fetchLeetCodeOpen, setFetchLeetCodeOpen] = useState(false);
  const [endSessionConfirmOpen, setEndSessionConfirmOpen] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState("end-session");
  const [fetchedProblem, setFetchedProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const skipBroadcastRef = useRef(false);
  const broadcastTimerRef = useRef(null);
  const attemptedJoinKeyRef = useRef("");
  const syncClientIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const {
    data: sessionData,
    isLoading: loadingSession,
    isError: sessionLoadError,
    error: sessionLoadErrorDetail,
    refetch,
  } = useSessionById(id, {
    publicRead:
      new URLSearchParams(location.search).get("role") === "guest" && !user,
  });
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();
  const updateSessionQuestionMutation = useUpdateSessionQuestion();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;
  const isGuestJoin =
    new URLSearchParams(location.search).get("role") === "guest";
  const canManageQuestion = isHost && !isGuestJoin;
  const currentJoinTarget = `${location.pathname}${location.search}`;

  const { call, channel, chatClient, isInitializingCall, streamClient } =
    useStreamClient(session, loadingSession, isHost, isParticipant);

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const displayProblem = fetchedProblem || problemData;
  const displayDescriptionNotes = (displayProblem?.description?.notes || [])
    .map((note) => String(note || "").trim())
    .filter(Boolean)
    .filter((note) => !isStructuralHeadingLine(note));
  const displayExamples = (displayProblem?.examples || []).filter(
    (example) =>
      (example?.input && String(example.input).trim()) ||
      (example?.output && String(example.output).trim()) ||
      (example?.explanation && String(example.explanation).trim()),
  );
  const displayDifficulty =
    fetchedProblem?.difficulty || session?.difficulty || "easy";

  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    if (joinSessionMutation.isPending) return;

    const joinKey = `${id}:${user.id}`;
    if (attemptedJoinKeyRef.current === joinKey) return;
    attemptedJoinKeyRef.current = joinKey;

    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [
    session,
    user,
    loadingSession,
    isHost,
    isParticipant,
    id,
    joinSessionMutation,
    joinSessionMutation.isPending,
    refetch,
  ]);

  useEffect(() => {
    if (!session || loadingSession) return;
    const isPlaybackMode =
      new URLSearchParams(location.search).get("mode") === "playback";
    if (session.status === "completed" && !isPlaybackMode)
      navigate("/dashboard");
  }, [session, loadingSession, location.search, navigate]);

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

  useEffect(() => {
    const savedQuestion = session?.currentQuestion;
    if (!savedQuestion) return;

    setFetchedProblem((prev) => {
      if (prev?.title === savedQuestion?.title) return prev;
      return savedQuestion;
    });
  }, [session?.currentQuestion]);

  useEffect(() => {
    if (!call) return;

    const handleSyncEvent = (event) => {
      const payload = event?.custom || event;
      if (!payload) return;
      if (payload?.syncClientId === syncClientIdRef.current) return;

      if (
        payload?.syncType === "editor_update" ||
        typeof payload?.editorCode === "string"
      ) {
        const nextLanguage = payload?.language || "javascript";
        const nextCode =
          typeof payload?.editorCode === "string" ? payload.editorCode : "";

        skipBroadcastRef.current = true;
        setSelectedLanguage(nextLanguage);
        setCode(nextCode);
        return;
      }

      if (payload?.syncType === "question_update" || payload?.question) {
        if (!payload?.question) return;

        skipBroadcastRef.current = true;
        setFetchedProblem(payload.question);
        setSelectedLanguage("javascript");
        setCode(payload.question?.starterCode?.javascript || "");
        setTestResults([]);
      }
    };

    const subscription = call.on("custom", handleSyncEvent);

    return () => {
      if (typeof subscription === "function") subscription();
      else subscription?.unsubscribe?.();
    };
  }, [call]);

  useEffect(() => {
    if (!call) return;

    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false;
      return;
    }

    if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);

    broadcastTimerRef.current = setTimeout(() => {
      call
        .sendCustomEvent({
          type: "editor_update",
          syncType: "editor_update",
          syncClientId: syncClientIdRef.current,
          language: selectedLanguage,
          editorCode: typeof code === "string" ? code : "",
          custom: {
            syncType: "editor_update",
            syncClientId: syncClientIdRef.current,
            language: selectedLanguage,
            editorCode: typeof code === "string" ? code : "",
          },
        })
        .catch((err) => {
          console.error("Failed to sync editor update", err);
        });
    }, 120);

    return () => {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    };
  }, [call, selectedLanguage, code]);

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
    if (!canManageQuestion) return;

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
    setConfirmActionType("end-session");
    setEndSessionConfirmOpen(true);
  };

  const handleHangUpAction = () => {
    setConfirmActionType(isHost ? "end-session" : "leave-session");
    setEndSessionConfirmOpen(true);
  };

  const handleConfirmSessionAction = () => {
    setEndSessionConfirmOpen(false);

    if (confirmActionType === "leave-session") {
      navigate("/dashboard");
      return;
    }

    endSessionMutation.mutate(id, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  const handleQuestionFetched = (newProblem) => {
    if (!canManageQuestion) return;

    setFetchedProblem(newProblem);
    setSelectedLanguage("javascript");
    setCode(newProblem.starterCode?.javascript || "");
    setTestResults([]);

    const questionPayload = {
      title: newProblem.title,
      difficulty: newProblem.difficulty,
      category: newProblem.category,
      description: newProblem.description,
      examples: newProblem.examples,
      constraints: newProblem.constraints,
      starterCode: {
        javascript: newProblem?.starterCode?.javascript || "",
      },
    };

    if (id) {
      updateSessionQuestionMutation.mutate({
        id,
        question: questionPayload,
      });
    }

    call
      ?.sendCustomEvent({
        type: "question_update",
        syncType: "question_update",
        syncClientId: syncClientIdRef.current,
        question: questionPayload,
        custom: {
          syncType: "question_update",
          syncClientId: syncClientIdRef.current,
          question: questionPayload,
        },
      })
      .catch((err) => {
        console.error("Failed to sync question update", err);
      });
  };

  if (!loadingSession && !session) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Unable to open this session
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This invite link may be invalid, expired, or the server may still
              be running an older build.
            </p>
            {sessionLoadError && (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {sessionLoadErrorDetail?.response?.data?.message ||
                  sessionLoadErrorDetail?.message ||
                  "Could not fetch session details"}
              </p>
            )}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                className="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => refetch()}
              >
                Retry
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-xl"
                onClick={() => navigate("/")}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      {!user && session && (
        <div className="mx-4 mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Sign in to join this session
              </p>
              <p className="text-sm text-slate-500">
                You can preview the session here, then sign in to join the call.
              </p>
            </div>
            <SignInButton
              mode="modal"
              forceRedirectUrl={currentJoinTarget}
              fallbackRedirectUrl={currentJoinTarget}
            >
              <button
                type="button"
                className="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                Sign in to join
              </button>
            </SignInButton>
          </div>
        </div>
      )}

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

      {/* End Session Confirmation Modal */}
      {endSessionConfirmOpen && (
        <div className="modal modal-open z-100">
          <div className="modal-box w-full max-w-sm p-0 overflow-hidden shadow-2xl border border-base-300">
            <div className="px-6 py-5 border-b border-base-300/60 bg-error/10">
              <h3 className="font-bold text-lg text-error">
                {confirmActionType === "leave-session"
                  ? "Leave Session?"
                  : "End Session?"}
              </h3>
            </div>

            <div className="px-6 py-5">
              <p className="text-base-content/90">
                {confirmActionType === "leave-session"
                  ? "Are you sure you want to leave this session?"
                  : "Are you sure you want to end this session? All participants will be notified and this action cannot be undone."}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-base-300/60 bg-base-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEndSessionConfirmOpen(false)}
                disabled={endSessionMutation.isPending}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSessionAction}
                disabled={endSessionMutation.isPending}
                className="btn btn-sm btn-error"
              >
                {endSessionMutation.isPending ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Ending...
                  </>
                ) : confirmActionType === "leave-session" ? (
                  "Leave Session"
                ) : (
                  "End Session"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setEndSessionConfirmOpen(false)}
          />
        </div>
      )}

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
                        <div className="mt-2">
                          <span
                            className={`badge badge-sm rounded-full px-3 py-2 ${getDifficultyBadgeClass(displayDifficulty)}`}
                          >
                            {(displayDifficulty?.slice(0, 1).toUpperCase() ||
                              "E") + (displayDifficulty?.slice(1) || "asy")}
                          </span>
                        </div>
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

                      <div className="flex items-center gap-2 justify-end w-full max-w-160 min-w-0">
                        {isHost && session?.status === "active" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShareMeetingOpen(true)}
                              className="btn btn-sm h-9 sm:h-10 rounded-xl border border-primary/55 bg-primary/10 hover:bg-primary/20 text-primary gap-1.5 sm:gap-2 px-2 sm:px-3 flex-1 min-w-0"
                              title="Share a join link like Google Meet"
                            >
                              <Link2Icon className="w-4 h-4 shrink-0" />
                              <span className="truncate text-xs sm:text-sm">
                                Share meeting
                              </span>
                            </button>
                            {canManageQuestion && (
                              <button
                                type="button"
                                onClick={() => setFetchLeetCodeOpen(true)}
                                className="btn btn-sm h-9 sm:h-10 rounded-xl border border-accent/55 bg-accent/10 hover:bg-accent/20 text-accent px-2 sm:px-3 flex-1 min-w-0"
                                title="Fetch a question from LeetCode"
                              >
                                <span className="truncate text-xs sm:text-sm">
                                  Fetch Question
                                </span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleEndSession}
                              disabled={endSessionMutation.isPending}
                              className="btn btn-sm h-9 sm:h-10 rounded-xl bg-error hover:bg-error/90 border-error text-error-content gap-1.5 sm:gap-2 px-2 sm:px-3 flex-1 min-w-0"
                            >
                              {endSessionMutation.isPending ? (
                                <Loader2Icon className="w-4 h-4 animate-spin shrink-0" />
                              ) : (
                                <LogOutIcon className="w-4 h-4 shrink-0" />
                              )}
                              <span className="truncate text-xs sm:text-sm">
                                End Session
                              </span>
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
                          {displayDescriptionNotes.map((note, idx) => (
                            <p key={idx} className="text-base-content/90">
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {displayExamples.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">
                          Examples
                        </h2>
                        <div className="space-y-4">
                          {displayExamples.map((example, idx) => (
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
                      canChangeLanguage={canManageQuestion}
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
                      <VideoCallUI
                        chatClient={chatClient}
                        channel={channel}
                        onHangUp={handleHangUpAction}
                      />
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
