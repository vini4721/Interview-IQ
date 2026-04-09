import { SignInButton, useUser } from "@clerk/clerk-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ActivityIcon,
  CheckCheckIcon,
  CheckIcon,
  ChevronRightIcon,
  Clock3Icon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const SNIPPETS = [
  `function scoreCandidate(data) {
  const metrics = ["logic", "clarity", "velocity"];
  return metrics.map((m) => \`\${m}:\${data[m]}\`).join(" | ");
}`,
  `const interview = {
  role: "Frontend Engineer",
  outcome: "Strong Hire",
  confidence: 0.93,
};`,
  `for (const test of testCases) {
  const pass = runCandidateCode(test.input) === test.expected;
  console.log(pass ? "PASS" : "FAIL", test.name);
}`,
];

const TERMINAL_LINES = [
  "$ connect --room interview-7821",
  "[ok] secure tunnel established",
  "$ run candidate_solution.ts --tests all",
  "[pass] case_01: two sum baseline",
  "[pass] case_02: duplicate values",
  "[pass] case_03: large input stream",
  "[info] interviewer note: asked complexity follow-up",
  "[live] candidate typing...",
];

const ASCII_HACKER = [
  "   .----.",
  "  / .==. \\",
  " / /____\\ \\",
  " | | _  _ | |",
  " | |(o)(o)| |",
  " | |  /\\  | |",
  " | | |==| | |",
  " |_| |__| |_|",
  " /__\\____/__\\",
  "  [interviewIQ]",
];

function TypewriterCode() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = SNIPPETS[snippetIndex];
    const step = isDeleting ? 2 : 1;
    const speed = isDeleting ? 16 : 28;

    const timer = setTimeout(() => {
      if (!isDeleting && displayed.length < current.length) {
        setDisplayed(current.slice(0, displayed.length + step));
        return;
      }

      if (!isDeleting && displayed.length >= current.length) {
        setTimeout(() => setIsDeleting(true), 650);
        return;
      }

      if (isDeleting && displayed.length > 0) {
        setDisplayed(
          current.slice(0, Math.max(0, displayed.length - step * 2)),
        );
        return;
      }

      if (isDeleting && displayed.length === 0) {
        setIsDeleting(false);
        setSnippetIndex((prev) => (prev + 1) % SNIPPETS.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayed, isDeleting, snippetIndex]);

  const lines = displayed.split("\n");
  const safeLines = lines.length ? lines : [""];
  const lastLineIndex = safeLines.length - 1;

  return (
    <div className="rounded-xl overflow-hidden border border-[#2e3950] bg-[#1e1e1e] shadow-xl">
      <div className="h-9 px-3 border-b border-[#2b2b2b] bg-[#252526] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="text-[11px] text-[#c8c8c8] tracking-wide">
          candidate.solution.ts
        </div>
        <div className="text-[10px] text-[#7d7d7d]">UTF-8</div>
      </div>

      <div className="flex min-h-60 font-mono text-[13px] leading-6">
        <div className="w-11 bg-[#181818] text-[#6e7681] border-r border-[#2b2b2b] py-3 text-right pr-2 select-none">
          {safeLines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div className="flex-1 py-3 px-4 text-[#d4d4d4] bg-[#1e1e1e] overflow-x-auto">
          {safeLines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line}
              {i === lastLineIndex && (
                <span className="animate-pulse text-[#4fc1ff]">|</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HackerTerminal() {
  const [showAscii, setShowAscii] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const introTimer = setTimeout(() => setShowAscii(false), 2200);

    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (showAscii) return;

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= TERMINAL_LINES.length + 1) return 1;
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [showAscii]);

  const shownLines = TERMINAL_LINES.slice(
    0,
    Math.min(visibleCount, TERMINAL_LINES.length),
  );

  return (
    <div className="rounded-2xl border border-[#27452e] bg-[#07120a] shadow-[0_0_45px_rgba(56,189,95,0.12)] overflow-hidden h-80">
      <div className="h-9 px-3 border-b border-[#1e3624] bg-[#0b1910] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] tracking-wide text-[#92b89e]">
          INTERVIEWIQ_TERMINAL
        </span>
        <span className="text-[10px] text-[#6f987b]">LIVE</span>
      </div>

      <div className="h-[calc(100%-2.25rem)] p-4 sm:p-5 font-mono text-[12.5px] leading-6 bg-[radial-gradient(circle_at_top,#101722_0%,#070c14_68%)] text-[#8ba999] overflow-y-auto">
        {showAscii ? (
          <div className="whitespace-pre text-[#a8c0b1] text-[12px] leading-5">
            {ASCII_HACKER.join("\n")}
            <div className="mt-2 text-[#7d998b]">
              initializing secure shell...
            </div>
          </div>
        ) : (
          <>
            {shownLines.map((line, i) => (
              <motion.div
                key={`${line}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  line.startsWith("$") ? "text-[#9fb8a7]" : "text-[#7d998b]"
                }
              >
                {line}
              </motion.div>
            ))}

            <div className="text-[#9fb8a7]">
              <span className="animate-pulse">▋</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TechSignalGrid() {
  const titlePool = [
    "Max Profit With K Transactions",
    "Merge Intervals in O(n log n)",
    "LRU Cache Design",
    "Top K Frequent Elements",
    "Serialize Binary Tree",
  ];
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [deletingTitle, setDeletingTitle] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, {
    stiffness: 320,
    damping: 14,
    mass: 0.35,
  });
  const smoothRotateY = useSpring(rotateY, {
    stiffness: 320,
    damping: 14,
    mass: 0.35,
  });

  const handleRun = () => {
    if (running) return;
    setRunning(true);
    setSubmitted(false);
    setTimeout(() => {
      setRunning(false);
      setCycle((prev) => prev + 1);
    }, 1400);
  };

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setCycle((prev) => prev + 1);
    }, 900);
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(x * 20);
    rotateX.set(-y * 16);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  useEffect(() => {
    const currentTitle = titlePool[titleIndex];
    const step = deletingTitle ? 2 : 1;
    const speed = deletingTitle ? 22 : 36;

    const timer = setTimeout(() => {
      if (!deletingTitle && typedTitle.length < currentTitle.length) {
        setTypedTitle(currentTitle.slice(0, typedTitle.length + step));
        return;
      }

      if (!deletingTitle && typedTitle.length >= currentTitle.length) {
        setTimeout(() => setDeletingTitle(true), 900);
        return;
      }

      if (deletingTitle && typedTitle.length > 0) {
        setTypedTitle(
          currentTitle.slice(0, Math.max(0, typedTitle.length - step * 2)),
        );
        return;
      }

      if (deletingTitle && typedTitle.length === 0) {
        setDeletingTitle(false);
        setTitleIndex((prev) => (prev + 1) % titlePool.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [typedTitle, deletingTitle, titleIndex]);

  return (
    <div className="mx-auto w-full max-w-4xl perspective-distant">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6 }}
        style={{
          transformStyle: "preserve-3d",
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          rotateZ: 0,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-[#244063] bg-linear-to-b from-[#091c34] to-[#07172b] p-3 will-change-transform"
      >
        <motion.div
          style={{ transform: "translateZ(28px)" }}
          className="rounded-xl border border-[#2b4668] bg-[#0a203a] p-3 shadow-[0_16px_22px_rgba(0,0,0,0.24)]"
        >
          <div className="mb-2 text-xl font-semibold text-[#dce8f8]">
            Prompt
          </div>
          <p className="text-lg font-semibold text-[#edf4ff]">
            {typedTitle}
            <span className="animate-pulse text-[#8ea2bd]">|</span>
          </p>
          <div className="mt-3 space-y-2">
            {[82, 76, 64, 74, 68, 84].map((w, i) => (
              <div
                key={`prompt-${i}`}
                className="h-3 rounded bg-[#284463]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ transform: "translateZ(28px)" }}
          className="rounded-xl border border-[#2b4668] bg-[#0a203a] p-3 shadow-[0_16px_22px_rgba(0,0,0,0.24)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xl font-semibold text-[#dce8f8]">Input</span>
            <button
              onClick={handleRun}
              className="rounded-md bg-[#0d5ee3] px-4 py-1 text-xl font-semibold text-white hover:bg-[#1e6aeb]"
            >
              {running ? "Running..." : "Run"}
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["#595ce5", "#7a4db1", "#d39b24", "#7ac46f", "#5f6fff"].map(
                (color, i) => (
                  <span
                    key={`in-a-${i}`}
                    className="h-4 rounded"
                    style={{ backgroundColor: color, width: `${30 + i * 8}px` }}
                  />
                ),
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {["#4fb7aa", "#5e60f2", "#d39b24", "#7a4db1", "#5f6fff"].map(
                (color, i) => (
                  <span
                    key={`in-b-${i}`}
                    className="h-4 rounded"
                    style={{
                      backgroundColor: color,
                      width: `${36 + i * 10}px`,
                    }}
                  />
                ),
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {["#7a4db1", "#7ac46f", "#d39b24", "#4fb7aa", "#5f6fff"].map(
                (color, i) => (
                  <span
                    key={`in-c-${i}`}
                    className="h-4 rounded"
                    style={{
                      backgroundColor: color,
                      width: `${26 + i * 12}px`,
                    }}
                  />
                ),
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ transform: "translateZ(6px) translateY(10px)" }}
          className="rounded-xl border border-[#2b4668] bg-[#0a203a] p-3 shadow-[0_18px_26px_rgba(0,0,0,0.28)]"
        >
          <div className="mb-2 text-xl font-semibold text-[#dce8f8]">Tests</div>
          <div className="space-y-3">
            {[0, 1, 2].map((row) => (
              <div key={`test-${row}`} className="rounded-lg bg-[#1b3551] p-3">
                <div className="flex flex-wrap gap-2">
                  {["#5f6fff", "#7ac46f", "#d39b24", "#7a4db1"].map(
                    (color, i) => (
                      <span
                        key={`t-${row}-${i}`}
                        className="h-4 rounded"
                        style={{
                          backgroundColor: color,
                          width: `${20 + ((row + i) % 4) * 16}px`,
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ transform: "translateZ(6px) translateY(10px)" }}
          className="rounded-xl border border-[#2b4668] bg-[#0a203a] p-3 shadow-[0_18px_26px_rgba(0,0,0,0.28)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xl font-semibold text-[#dce8f8]">Output</span>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-[#069e37] px-4 py-1 text-xl font-semibold text-white hover:bg-[#08b740]"
            >
              {submitting
                ? "Submitting..."
                : submitted
                  ? "Submitted"
                  : "Submit"}
            </button>
          </div>
          <div className="space-y-3">
            {(submitted ? [true, true, true] : [true, false, false]).map(
              (ok, i) => {
                const animatedFail = !ok && cycle % 2 === 1 && i === 1;
                return (
                  <div key={`out-${i}`} className="rounded-lg bg-[#1b3551] p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full border-2 ${ok ? "border-[#3db36a] text-[#3db36a]" : "border-[#e34f4f] text-[#e34f4f]"}`}
                      >
                        {ok ? "✓" : "✕"}
                      </div>
                      <motion.div
                        animate={
                          running
                            ? { width: ["8%", "55%", "32%", "72%", "48%"] }
                            : {
                                width: ok
                                  ? "74%"
                                  : animatedFail
                                    ? "58%"
                                    : "77%",
                              }
                        }
                        transition={{ duration: running ? 1.2 : 0.45 }}
                        className={`h-4 rounded ${ok ? "bg-[#3db36a]" : "bg-[#e34f4f]"}`}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </motion.div>

        <div className="pointer-events-none absolute -bottom-8 left-10 right-10 h-8 rounded-full bg-black/35 blur-2xl" />
      </motion.div>
    </div>
  );
}

function HeroChaosBanner({ pointerX, pointerY, pointerOpacity }) {
  const accumulationMask = useMotionTemplate`
    radial-gradient(180px 180px at ${pointerX}px ${pointerY}px, rgba(255,255,255,0.96), rgba(255,255,255,0.68) 46%, rgba(255,255,255,0.2) 72%, transparent 100%)
  `;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-15%,rgba(120,172,225,0.14),transparent_28%),linear-gradient(180deg,#05070d_0%,#071122_48%,#0a182c_100%)]" />

      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(circle,#6f8fb2 0.8px,transparent 1px), radial-gradient(circle,#5e7da1 0.7px,transparent 0.9px)",
          backgroundSize: "26px 26px, 42px 42px",
          backgroundPosition: "0 0, 14px 10px",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(78,136,196,0.2),transparent_38%)]" />

      <motion.div
        className="absolute inset-0"
        style={{
          opacity: pointerOpacity,
          WebkitMaskImage: accumulationMask,
          maskImage: accumulationMask,
          backgroundImage:
            "radial-gradient(circle,#b8d7ff 1.3px,transparent 1.45px), radial-gradient(circle,#93bee7 1px,transparent 1.15px)",
          backgroundSize: "14px 14px, 22px 22px",
          backgroundPosition: "0 0, 9px 8px",
        }}
      />
    </div>
  );
}

function HomePage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget =
    new URLSearchParams(location.search).get("redirect") ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("interviewiq_redirect_target")
      : null) ||
    "/dashboard";
  const partnerLogos = ["NEXUS", "COBALT", "SYNAPSE", "QUANTUM", "ORBIT"];
  const heroSectionRef = useRef(null);
  useEffect(() => {
    if (!isSignedIn) return;

    const safeTarget = redirectTarget.startsWith("/")
      ? redirectTarget
      : "/dashboard";

    if (safeTarget !== "/") {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("interviewiq_redirect_target");
      }
      navigate(safeTarget, { replace: true });
    }
  }, [isSignedIn, redirectTarget, navigate]);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end end"],
  });
  const monitorScale = useTransform(
    heroProgress,
    [0, 0.45, 0.85],
    [1, 0.88, 0.62],
  );
  const monitorY = useTransform(heroProgress, [0, 0.85], [0, -140]);
  const monitorX = useTransform(heroProgress, [0, 0.85], [0, 380]);
  const monitorRotateX = useTransform(heroProgress, [0, 0.8], [0, 14]);
  const monitorRotateY = useTransform(heroProgress, [0, 0.85], [-8, -46]);
  const monitorOpacity = useTransform(heroProgress, [0.7, 1], [1, 0]);
  const introOpacity = useTransform(heroProgress, [0, 0.3, 0.9], [1, 1, 0.75]);
  const introY = useTransform(heroProgress, [0, 0.75], [0, -24]);
  const hintOpacity = useTransform(
    heroProgress,
    [0, 0.35, 0.65],
    [0.9, 0.85, 0],
  );
  const monitorSkeletonOpacity = useTransform(
    heroProgress,
    [0, 0.2, 0.35],
    [1, 0.2, 0],
  );
  const monitorDashboardOpacity = useTransform(
    heroProgress,
    [0, 0.28, 0.72],
    [1, 1, 0],
  );
  const monitorDashboardY = useTransform(heroProgress, [0, 0.72], [0, -14]);
  const pointerX = useMotionValue(-200);
  const pointerY = useMotionValue(-200);
  const pointerActive = useMotionValue(0);
  const pointerSmoothX = useSpring(pointerX, {
    stiffness: 180,
    damping: 30,
    mass: 0.25,
  });
  const pointerSmoothY = useSpring(pointerY, {
    stiffness: 180,
    damping: 30,
    mass: 0.25,
  });
  const pointerOpacity = useSpring(pointerActive, {
    stiffness: 160,
    damping: 28,
    mass: 0.3,
  });

  return (
    <div className="min-h-screen bg-[#05070d] text-[#e7ebf3]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] left-[6%] h-56 w-56 rounded-full bg-[#8ea2bd]/8 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 24, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[8%] h-64 w-64 rounded-full bg-[#2a7fb7]/10 blur-3xl"
        />
      </div>

      <main>
        <section
          ref={heroSectionRef}
          className="relative h-[220vh] border-b border-[#141c2a]"
        >
          <div
            className="sticky top-0 h-screen overflow-hidden"
            onPointerMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              pointerX.set(event.clientX - bounds.left);
              pointerY.set(event.clientY - bounds.top);
              pointerActive.set(0.95);
            }}
            onPointerLeave={() => {
              pointerActive.set(0);
            }}
          >
            <HeroChaosBanner
              pointerX={pointerSmoothX}
              pointerY={pointerSmoothY}
              pointerOpacity={pointerOpacity}
            />

            <motion.div
              style={{ opacity: hintOpacity }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-30 text-xs tracking-[0.16em] text-[#b8b0df]"
            >
              SCROLL TO EXIT MONITOR
            </motion.div>

            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_22%_42%,rgba(108,156,208,0.14),transparent_26%),radial-gradient(circle_at_78%_32%,rgba(78,125,176,0.12),transparent_24%)]" />

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 min-h-screen grid lg:grid-cols-[1fr_1fr] gap-8 items-center">
              <motion.div
                style={{ opacity: introOpacity, y: introY }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[#6d6299]/55 bg-[#140f2e]/70 px-3 py-1 text-[11px] tracking-[0.14em] text-[#c3bce8]">
                  LIVE INTRO EXPERIENCE
                </div>
                <p className="text-sm sm:text-base text-[#aba7d8]">
                  InterviewIQ
                </p>
                <h1 className="mt-2 text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.03] tracking-tight text-[#f2f4fb]">
                  Hire the{" "}
                  <span className="text-[#9e9ee6] italic">Architects</span>
                  <br />
                  of the Future.
                </h1>
                <p className="mt-6 text-[#b8bdd4] max-w-xl leading-relaxed">
                  InterviewIQ is the elite technical assessment platform where
                  deep engineering talent meets fluid visual precision, secure
                  intelligence, and built-for-hiring stakes.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {isSignedIn ? (
                    <button
                      className="btn rounded-lg px-7 py-2.5 bg-[#c2b4ff] hover:bg-[#d5cbff] border-[#c2b4ff] text-[#120a2f] font-semibold shadow-[0_10px_26px_rgba(164,146,240,0.35)]"
                      onClick={() => navigate("/dashboard")}
                    >
                      Start Recruiting
                    </button>
                  ) : (
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl={redirectTarget}
                      fallbackRedirectUrl={redirectTarget}
                    >
                      <button className="btn rounded-lg px-7 py-2.5 bg-[#c2b4ff] hover:bg-[#d5cbff] border-[#c2b4ff] text-[#120a2f] font-semibold shadow-[0_10px_26px_rgba(164,146,240,0.35)]">
                        Start Recruiting
                      </button>
                    </SignInButton>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl">
                  {[
                    { value: "40+", label: "Languages", accent: "#9f95ff" },
                    { value: "<60s", label: "Setup Time", accent: "#8ac4ff" },
                    { value: "99.99%", label: "Uptime", accent: "#88e2c0" },
                  ].map((item) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="group relative overflow-hidden rounded-xl border border-[#5e5690]/65 bg-[#110c30]/78 px-4 py-3 text-left shadow-[0_8px_22px_rgba(10,8,26,0.45)] transition-colors hover:border-[#9e8df0]"
                    >
                      <span
                        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-85"
                        style={{ backgroundColor: item.accent }}
                      />
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(185,170,255,0.18),transparent_40%)]" />

                      <span className="relative z-10 flex items-start justify-between gap-3">
                        <span>
                          <span className="block text-2xl leading-none font-black text-[#eef1ff] tracking-tight">
                            {item.value}
                          </span>
                          <span className="mt-1.5 block text-sm leading-none text-[#aeb3d9] font-medium">
                            {item.label}
                          </span>
                        </span>
                        <span
                          className="mt-1 h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: item.accent,
                            boxShadow: `0 0 14px ${item.accent}`,
                          }}
                        />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                style={{
                  scale: monitorScale,
                  y: monitorY,
                  x: monitorX,
                  rotateX: monitorRotateX,
                  rotateY: monitorRotateY,
                  opacity: monitorOpacity,
                }}
                className="z-20 justify-self-center lg:justify-self-end perspective-[1400px]"
              >
                <div className="w-[88vw] max-w-140">
                  <div className="rounded-[22px] border border-[#7668ac]/70 bg-[#0e0d26] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.58)]">
                    <div className="rounded-2xl border border-[#9c88e0]/45 bg-[#0a0f2b] p-2.5 min-h-70 sm:min-h-80">
                      <motion.div
                        style={{
                          opacity: monitorDashboardOpacity,
                          y: monitorDashboardY,
                        }}
                        className="h-full rounded-lg border border-[#4e5a8a]/55 bg-[#11183e] overflow-hidden"
                      >
                        <div className="h-full grid grid-rows-[26px_1fr] bg-[#10183b]">
                          <div className="border-b border-[#344a7c] bg-[#1a2758] px-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[6px] text-[#cfe0ff]">
                              <span className="font-semibold">Two Sum</span>
                              <span className="rounded border border-[#5f79b1] bg-[#25386f] px-1 text-[5px] text-[#d5e4ff]">
                                Easy
                              </span>
                              <span className="text-[#9ab3e3]">
                                Host: Vinayak
                              </span>
                              <span className="text-[#9ab3e3]">2/2</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="rounded border border-[#4a6eb5] bg-[#27478d] px-1 py-px text-[5px] text-[#deebff]">
                                Share
                              </button>
                              <button className="rounded border border-[#8f4b59] bg-[#6b2f3a] px-1 py-px text-[5px] text-[#ffd8de]">
                                End
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-[1fr_46%] gap-1.5 p-1.5">
                            <div className="grid grid-rows-[42%_58%] gap-1.5">
                              <div className="rounded border border-[#334c86] bg-[#16234d] overflow-hidden">
                                <div className="h-5 border-b border-[#32487b] bg-[#1d2f62] px-1.5 flex items-center justify-between">
                                  <span className="text-[6px] text-[#d8e5ff]">
                                    Problem Description
                                  </span>
                                  <span className="text-[5px] text-[#9eb6e5]">
                                    Arrays
                                  </span>
                                </div>
                                <div className="p-1.5 space-y-1">
                                  <p className="text-[5px] text-[#b7caef] leading-tight">
                                    Given an array of integers, return indices
                                    of the two numbers such that they add up to
                                    a target.
                                  </p>
                                  <div className="rounded bg-[#101a3d] border border-[#2f4374] px-1.5 py-1">
                                    <p className="text-[5px] text-[#9bb3e3]">
                                      Input: nums = [2,7,11,15], target = 9
                                    </p>
                                    <p className="text-[5px] text-[#d2e1ff]">
                                      Output: [0,1]
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded border border-[#334c86] bg-[#111c43] overflow-hidden">
                                <div className="h-5 border-b border-[#32487b] bg-[#1d2f62] px-1.5 flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#7ee787]" />
                                    <span className="text-[6px] text-[#d8e5ff]">
                                      Code Editor
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[5px] text-[#aac1ee]">
                                    <span className="rounded border border-[#4d67a1] bg-[#223464] px-1">
                                      JavaScript
                                    </span>
                                    <span className="rounded border border-[#4d67a1] bg-[#2a4a8f] px-1 text-[#dce9ff]">
                                      Run Code
                                    </span>
                                  </div>
                                </div>
                                <div className="p-1.5 font-mono space-y-1">
                                  {[
                                    "function twoSum(nums, target) {",
                                    "  const map = new Map();",
                                    "  for (let i = 0; i < nums.length; i++) {",
                                    "    const c = target - nums[i];",
                                    "    if (map.has(c)) return [map.get(c), i];",
                                    "    map.set(nums[i], i);",
                                    "  }",
                                    "}",
                                  ].map((line) => (
                                    <p
                                      key={line}
                                      className="text-[5px] leading-tight text-[#a9bfe9]"
                                    >
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-rows-[62%_38%] gap-1.5">
                              <div className="rounded border border-[#335088] bg-[#152652] overflow-hidden">
                                <div className="h-5 border-b border-[#32487b] bg-[#1d2f62] px-1.5 flex items-center justify-between">
                                  <span className="text-[6px] text-[#d8e5ff]">
                                    Live Call
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#7ee787]" />
                                    <span className="text-[5px] text-[#9fb8e7]">
                                      2 participants
                                    </span>
                                  </div>
                                </div>
                                <div className="p-1.5 grid grid-cols-2 gap-1.5 h-[calc(100%-1.25rem)]">
                                  <div className="rounded border border-[#415b95] bg-[#1d3267] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(150,190,255,0.28),transparent_45%)]" />
                                    <span className="absolute bottom-1 left-1 text-[5px] text-[#dbe8ff]">
                                      Vinayak
                                    </span>
                                  </div>
                                  <div className="rounded border border-[#415b95] bg-[#1d3267] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(150,190,255,0.24),transparent_45%)]" />
                                    <span className="absolute bottom-1 left-1 text-[5px] text-[#dbe8ff]">
                                      Interviewer
                                    </span>
                                  </div>
                                  <div className="col-span-2 rounded border border-[#3b5287] bg-[#101a3c] px-1.5 py-1 flex items-center justify-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#2a4a8f]" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#2a4a8f]" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#7a3042]" />
                                  </div>
                                </div>
                              </div>

                              <div className="rounded border border-[#35508a] bg-[#121f49] overflow-hidden">
                                <div className="h-5 border-b border-[#32487b] bg-[#1d2f62] px-1.5 flex items-center justify-between">
                                  <span className="text-[6px] text-[#d8e5ff]">
                                    Output
                                  </span>
                                  <span className="text-[5px] text-[#89f0b2]">
                                    All tests passed
                                  </span>
                                </div>
                                <div className="p-1.5 font-mono space-y-0.5">
                                  <p className="text-[5px] text-[#89f0b2]">
                                    PASS case_01: two sum baseline
                                  </p>
                                  <p className="text-[5px] text-[#89f0b2]">
                                    PASS case_02: duplicate values
                                  </p>
                                  <p className="text-[5px] text-[#89f0b2]">
                                    PASS case_03: large input stream
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="mx-auto mt-2 h-4 w-40 rounded-full bg-[#181337] border border-[#5f548a]/60" />
                  <div className="mx-auto mt-1 h-2.5 w-56 rounded-full bg-[#15112f] border border-[#4d436f]/55" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="border-y border-[#141c2a] bg-[#071122]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
            <p className="text-center text-[10px] tracking-[0.18em] text-[#60708a] mb-4">
              EMPOWERING THE WORLD'S LEADING ENGINEERING TEAMS
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
              {partnerLogos.map((logo, i) => (
                <motion.div
                  key={logo}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -3 }}
                  className="text-[#becbe0] text-sm tracking-[0.08em] font-medium py-2"
                >
                  {logo}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-[#141c2a]"
        >
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
            <div className="w-full max-w-2xl">
              <HackerTerminal />
            </div>

            <div className="lg:justify-self-end">
              <p className="text-[11px] tracking-[0.16em] text-[#6c8f79] mb-3">
                LIVE TERMINAL FEED
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">
                Real-time interview console
              </h3>
              <p className="mt-3 text-[#8ea9bf] max-w-lg">
                Live command stream, test execution logs, and interviewer events
                in one secure shell.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-b border-[#141c2a]"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Environment-Grade Code
                <br />
                Execution.
              </h2>
              <p className="mt-4 text-[#90a2bb] max-w-lg leading-relaxed">
                Our sandboxed IDE supports 40+ languages with sub-millisecond
                latency, providing a real-world environment for candidates to
                thrive.
              </p>

              <div className="mt-7 grid sm:grid-cols-2 gap-3 max-w-xl">
                <div className="rounded-xl border border-[#25344f] bg-[#0b1628] p-4">
                  <p className="text-sm font-semibold">Multi-Lang Support</p>
                  <p className="text-xs text-[#8b9db5] mt-1">
                    Python JS Java Go
                  </p>
                </div>
                <div className="rounded-xl border border-[#25344f] bg-[#0b1628] p-4">
                  <p className="text-sm font-semibold">Secure Sandboxing</p>
                  <p className="text-xs text-[#8b9db5] mt-1">
                    Isolated runtime execution
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#263b59] bg-[#0b1424] p-4">
              <div className="text-[10px] tracking-[0.14em] text-[#7f95b2] mb-3">
                SOLUTION 01
              </div>
              <TypewriterCode />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-b border-[#141c2a]"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Live Interview In Progress
            </h2>
            <p className="mt-3 text-[#8ea1bb] max-w-3xl mx-auto">
              Watch interviewer and candidate collaborate in real time with
              active coding, test execution, and timeline updates.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-4">
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-[#25344f] bg-[#0b1628] p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#8aa0b9] tracking-wide">
                  <motion.span
                    animate={{ opacity: [0.45, 1, 0.45] }}
                    transition={{
                      duration: 1.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="size-2 rounded-full bg-[#8ea2bd]"
                  />
                  INTERVIEW ROOM LIVE
                </div>

                <div className="flex items-center gap-4 text-xs text-[#9cb1c9]">
                  <span className="inline-flex items-center gap-1.5">
                    <UsersIcon className="size-4" /> 2 participants
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3Icon className="size-4" /> 21:48 elapsed
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#22314a] bg-[#081221] p-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-[#2a3b59] bg-[#0c1a2f] p-3">
                    <p className="text-[#7e95b1] text-xs">Interviewer</p>
                    <p className="mt-1 font-semibold text-[#dce9f9]">
                      Riya Sharma
                    </p>
                    <p className="text-xs text-[#8ea4be] mt-1">
                      Asking follow-up on time complexity
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#2a3b59] bg-[#0c1a2f] p-3">
                    <p className="text-[#7e95b1] text-xs">Candidate</p>
                    <p className="mt-1 font-semibold text-[#dce9f9]">
                      Aarav Mehta
                    </p>
                    <p className="text-xs text-[#8ea4be] mt-1">
                      Refactoring to optimize hashmap lookup
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#8ca2bc] mb-2">
                    <span>Current test run: two-sum / sample set</span>
                    <span>3 / 4 passed</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1a2a43] overflow-hidden">
                    <motion.div
                      className="h-full bg-[#7f95b2]"
                      initial={{ width: "25%" }}
                      animate={{ width: ["25%", "75%", "75%"] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-[#25344f] bg-[#0b1628] p-6"
            >
              <div className="flex items-center justify-between text-xs text-[#8aa0b9]">
                <span>LIVE ACTIVITY FEED</span>
                <ActivityIcon className="size-4" />
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-lg border border-[#2a3b59] bg-[#0c1a2f] p-3">
                  <p className="text-[#7fa3c6] text-xs">00:21:15</p>
                  <p className="mt-1 text-[#dbe7f8]">
                    Candidate explains $O(n)$ approach clearly.
                  </p>
                </div>
                <div className="rounded-lg border border-[#2a3b59] bg-[#0c1a2f] p-3">
                  <p className="text-[#7fa3c6] text-xs">00:20:42</p>
                  <p className="mt-1 text-[#dbe7f8]">
                    Edge case added for duplicate elements.
                  </p>
                </div>
                <div className="rounded-lg border border-[#2a3b59] bg-[#0c1a2f] p-3">
                  <p className="text-[#7fa3c6] text-xs">00:19:58</p>
                  <p className="mt-1 text-[#dbe7f8]">
                    Interviewer requests trade-off discussion.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#2a3b59] bg-[#0c1a2f] p-3">
                <p className="text-xs text-[#8aa0b9]">Session status</p>
                <p className="mt-1 text-[#dbe7f8] font-semibold">
                  Healthy connection • low latency
                </p>
                <p className="mt-2 text-xs text-[#8aa0b9] inline-flex items-center gap-1.5">
                  <CheckIcon className="size-3.5 text-[#7f95b2]" /> Recording
                  enabled
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-b border-[#141c2a]">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Fortress-Grade Infrastructure
              </h2>
              <ul className="mt-5 space-y-3 text-[#95a8c2]">
                <li className="flex gap-2">
                  <CheckCheckIcon className="size-4 mt-0.5 text-[#7f95b2]" />{" "}
                  SOC2 Type II & GDPR compliant
                </li>
                <li className="flex gap-2">
                  <CheckCheckIcon className="size-4 mt-0.5 text-[#7f95b2]" />{" "}
                  End-to-end encryption
                </li>
                <li className="flex gap-2">
                  <CheckCheckIcon className="size-4 mt-0.5 text-[#7f95b2]" />{" "}
                  99.99% uptime SLA
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["SOC2 TYPE II", "AES-256", "VPC ISOLATION", "GDPR READY"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#24344f] bg-[#0b1628] p-5 flex items-center justify-center text-xs text-[#b7c7dd] tracking-wide"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-b border-[#141c2a]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <TechSignalGrid />
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="rounded-3xl border border-[#2a3d5c] bg-[#101d33] p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Ready to Evolve Your Engineering Standards?
            </h2>
            <p className="mt-3 text-[#9fb2cb] max-w-3xl mx-auto">
              Join top tech leaders who switched to InterviewIQ for a more
              precise and reliable technical hiring process.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {isSignedIn ? (
                <button
                  className="btn bg-[#8ea2bd] hover:bg-[#a2b4c9] border-[#8ea2bd] text-[#06111a] px-6 rounded-xl"
                  onClick={() => navigate("/dashboard")}
                >
                  Create Your Free Account
                </button>
              ) : (
                <SignInButton
                  mode="modal"
                  forceRedirectUrl={redirectTarget}
                  fallbackRedirectUrl={redirectTarget}
                >
                  <button className="btn bg-[#8ea2bd] hover:bg-[#a2b4c9] border-[#8ea2bd] text-[#06111a] px-6 rounded-xl">
                    Create Your Free Account
                  </button>
                </SignInButton>
              )}
              <button className="btn btn-outline border-[#334a6b] text-[#d5e1f3] rounded-xl px-6">
                Speak to an Expert
                <ChevronRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#1a263a] bg-[#060c18] text-[#8ea0bb]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <img
                    src="/interviewiq-logo.svg"
                    alt="InterviewIQ logo"
                    className="size-8 rounded-lg"
                  />
                  <span className="font-semibold tracking-wide text-sm text-[#e7ebf3]">
                    InterviewIQ
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed max-w-xs">
                  Technical hiring platform for collaborative coding interviews,
                  live execution, and AI-powered candidate insights.
                </p>
                <p className="mt-4 text-xs tracking-[0.08em] text-[#6f829e]">
                  BUILT FOR MODERN ENGINEERING TEAMS
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <a
                    href="#"
                    className="size-9 rounded-lg border border-[#27364f] bg-[#0b1528] flex items-center justify-center text-[#9cb3cf] hover:text-[#dbe7f8] hover:border-[#3a5278]"
                  >
                    <span className="text-[10px] font-semibold tracking-wide">
                      GH
                    </span>
                  </a>
                  <a
                    href="#"
                    className="size-9 rounded-lg border border-[#27364f] bg-[#0b1528] flex items-center justify-center text-[#9cb3cf] hover:text-[#dbe7f8] hover:border-[#3a5278]"
                  >
                    <span className="text-[10px] font-semibold tracking-wide">
                      IN
                    </span>
                  </a>
                  <a
                    href="#"
                    className="size-9 rounded-lg border border-[#27364f] bg-[#0b1528] flex items-center justify-center text-[#9cb3cf] hover:text-[#dbe7f8] hover:border-[#3a5278]"
                  >
                    <span className="text-[10px] font-semibold tracking-wide">
                      X
                    </span>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#dbe7f8]">
                  Product
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Live Coding
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Video Interviews
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Question Library
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Session Analytics
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#dbe7f8]">
                  Resources
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      API Docs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Security Guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Status
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#dbe7f8]">
                  Company
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#dbe7f8]">
                      Partners
                    </a>
                  </li>
                </ul>

                <div className="mt-6 rounded-xl border border-[#24344b] bg-[#0b1425] p-4">
                  <p className="text-xs text-[#6f829e] tracking-[0.08em]">
                    CONTACT
                  </p>
                  <p className="mt-2 text-sm text-[#dbe7f8]">
                    support@interviewiq.ai
                  </p>
                  <p className="mt-1 text-sm">+1 (800) 424-1010</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-[#1f2d43] bg-[#0a1323] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-[#dbe7f8] font-semibold">
                  Get Product Updates
                </p>
                <p className="text-sm mt-1 text-[#7f93b0]">
                  Monthly release notes, hiring playbooks, and interview best
                  practices.
                </p>
              </div>
              <div className="flex w-full lg:w-auto gap-2">
                <div className="relative w-full lg:w-80">
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    className="w-full h-11 rounded-xl border border-[#2a3e5d] bg-[#081223] px-3 text-sm text-[#dbe7f8] placeholder:text-[#69809e] outline-none focus:border-[#4a78b8]"
                  />
                </div>
                <button className="btn h-11 min-h-0 px-5 bg-[#8ea2bd] hover:bg-[#a2b4c9] border-[#8ea2bd] text-[#06111a]">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#1a263a] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[#7387a4]">
              <span>© 2026 INTERVIEWIQ. All rights reserved.</span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <a href="#" className="hover:text-[#dbe7f8]">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-[#dbe7f8]">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-[#dbe7f8]">
                  Cookies
                </a>
                <a href="#" className="hover:text-[#dbe7f8]">
                  Security
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default HomePage;
