"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/copy";
import { BRAND, TEXT } from "@/lib/brand";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/* Formation runs on its own clock, independent of the quiz state, so the
   mark keeps breathing behind every screen. */
const FORM_MS = 2600;

type Stage = "forming" | "intro" | "quiz" | "interstitial" | "result";

export default function Experience() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [stage, setStage] = useState<Stage>("forming");
  const [formation, setFormation] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null]);
  const [picked, setPicked] = useState<number | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  const [arOpen, setArOpen] = useState(false);

  const reduce = useReducedMotion();
  const t = COPY[lang];
  const total = t.questions.length;
  const score = answers.filter(Boolean).length;

  /* ---------- formation clock ---------- */
  useEffect(() => {
    if (reduce) {
      setFormation(1);
      setStage("intro");
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / FORM_MS);
      setFormation(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setStage("intro");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  /* ---------- pointer / tilt parallax ---------- */
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      setDrift({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      });
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      setDrift({
        x: Math.max(-1, Math.min(1, e.gamma / 35)),
        y: Math.max(-1, Math.min(1, (e.beta - 45) / 45)),
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [reduce]);

  /* ---------- answering ---------- */
  const answer = useCallback(
    (choice: number) => {
      if (picked !== null) return;
      const correct = choice === t.questions[qIndex].correct;
      setPicked(choice);
      setAnalysing(true);

      if ("vibrate" in navigator) {
        navigator.vibrate(correct ? [12, 18, 26] : [10, 40, 10]);
      }

      window.setTimeout(() => setAnalysing(false), 900);
      window.setTimeout(() => {
        setAnswers((prev) => {
          const next = [...prev];
          next[qIndex] = correct;
          return next;
        });
      }, 900);
    },
    [picked, qIndex, t.questions]
  );

  const advance = useCallback(() => {
    setPicked(null);
    if (qIndex < total - 1) setQIndex((i) => i + 1);
    else setStage("interstitial");
  }, [qIndex, total]);

  useEffect(() => {
    if (stage !== "interstitial") return;
    const id = window.setTimeout(() => setStage("result"), 2800);
    return () => clearTimeout(id);
  }, [stage]);

  const restart = () => {
    setAnswers([null, null, null]);
    setQIndex(0);
    setPicked(null);
    setStage("intro");
  };

  const invitationId = useRef(
    `AI-2026-${Math.floor(1000 + Math.random() * 9000)}`
  ).current;

  /* ---------- shared motion ---------- */
  const ease = [0.16, 0.8, 0.24, 1] as const;
  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 14, filter: reduce ? "none" : "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: reduce ? 0 : -10, filter: reduce ? "none" : "blur(4px)" },
  };

  /* local scrim behind text-heavy blocks, so content defends its own
     legibility instead of depending on whatever the scene is doing */
  const contentScrim = {
    background: "rgba(3,5,14,0.55)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 24,
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100dvh", background: BRAND.void }}
    >
      {/* ---------- 3D layer ---------- */}
      <div className="fixed inset-0 z-0">
        <Scene formation={formation} drift={drift} />
      </div>

      {/* vertical scrim keeps text legible over the bloom */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `linear-gradient(to bottom,
            rgba(3,5,14,0.30) 0%,
            rgba(3,5,14,0.55) 38%,
            rgba(3,5,14,0.88) 70%,
            rgba(3,5,14,0.96) 100%)`,
        }}
      />

      {/* ---------- chrome ---------- */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6">
        <span
          className="font-mono text-[10px] tracking-[0.22em] sm:text-[11px]"
          style={{ color: TEXT.secondary }}
        >
          {t.eyebrow}
        </span>

        <div className="flex items-center gap-3">
          {stage === "quiz" && (
            <span
              className="hidden font-mono text-[10px] tracking-[0.18em] sm:inline"
              style={{ color: TEXT.tertiary }}
            >
              {t.progressLabel} {qIndex + 1}/{total}
            </span>
          )}
          <button
            onClick={() => setLang((l) => (l === "en" ? "bn" : "en"))}
            className="rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors"
            style={{ borderColor: TEXT.hairline, color: TEXT.secondary }}
          >
            {t.langLabel}
          </button>
        </div>
      </header>

      {/* thin progress rule */}
      <div className="fixed inset-x-0 top-0 z-30 h-px" style={{ background: TEXT.hairline }}>
        <motion.div
          className="h-full"
          style={{ background: BRAND.logoBlue }}
          animate={{
            width:
              stage === "forming"
                ? `${formation * 18}%`
                : stage === "intro"
                ? "18%"
                : stage === "quiz"
                ? `${18 + ((qIndex + (picked !== null ? 1 : 0)) / total) * 64}%`
                : "100%",
          }}
          transition={{ duration: 0.6, ease }}
        />
      </div>

      {/* ---------- content ---------- */}
      <main className="relative z-20 flex min-h-[100dvh] flex-col items-center justify-end px-5 pb-10 pt-24 sm:justify-center sm:px-8 sm:pb-16">
        <AnimatePresence mode="wait">
          {/* ---- forming ---- */}
          {stage === "forming" && (
            <motion.p
              key="forming"
              {...fade}
              transition={{ duration: 0.5, ease }}
              className="font-mono text-[10px] tracking-[0.3em] sm:text-[11px]"
              style={{ color: TEXT.tertiary }}
            >
              INITIALISING
            </motion.p>
          )}

          {/* ---- intro ---- */}
          {stage === "intro" && (
            <motion.div
              key="intro"
              className="w-full max-w-lg text-center"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
              }}
            >
              {[
                <h1
                  key="w"
                  className="text-[clamp(3rem,17vw,6.5rem)] font-semibold leading-[0.9]"
                  style={{ color: BRAND.white, letterSpacing: "-0.045em" }}
                >
                  {t.wordmark}
                </h1>,
                <p
                  key="l"
                  className="mt-5 text-[15px] leading-relaxed sm:text-[17px]"
                  style={{ color: TEXT.primary }}
                >
                  {t.lede}
                </p>,
                <p
                  key="m"
                  className="mt-3 font-mono text-[10px] tracking-[0.16em] sm:text-[11px]"
                  style={{ color: TEXT.tertiary }}
                >
                  {t.meta}
                </p>,
                <div key="c" className="mt-9">
                  <button
                    onClick={() => setStage("quiz")}
                    className="group relative w-full overflow-hidden rounded-full px-8 py-4 text-[15px] font-medium transition-transform active:scale-[0.98] sm:w-auto"
                    style={{ background: BRAND.logoBlue, color: BRAND.void, minHeight: 52 }}
                  >
                    {t.cta}
                  </button>
                </div>,
              ].map((child, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: reduce ? 0 : 18, filter: reduce ? "none" : "blur(8px)" },
                    show: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.75, ease },
                    },
                  }}
                >
                  {child}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ---- quiz ---- */}
          {stage === "quiz" && (
            <motion.div
              key={`q-${qIndex}`}
              {...fade}
              transition={{ duration: 0.6, ease }}
              className="w-full max-w-xl"
              style={contentScrim}
            >
              <div
                className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em]"
                style={{ color: BRAND.logoBlue }}
              >
                <span>{t.questions[qIndex].index}</span>
                <span style={{ color: TEXT.hairline }}>/</span>
                <span style={{ color: TEXT.secondary }}>{t.questions[qIndex].tag}</span>
              </div>

              <h2
                className="mt-4 text-[19px] font-medium leading-snug sm:text-[24px]"
                style={{ color: BRAND.white, letterSpacing: "-0.015em" }}
              >
                {t.questions[qIndex].prompt}
              </h2>

              <div className="mt-6 space-y-2">
                {t.questions[qIndex].options.map((opt, i) => {
                  const isCorrect = i === t.questions[qIndex].correct;
                  const locked = picked !== null;
                  const revealed = locked && !analysing;

                  const border = revealed && isCorrect ? BRAND.success : TEXT.hairline;
                  const tint =
                    revealed && isCorrect ? `${BRAND.success}14` : "rgba(255,255,255,0.02)";
                  const dim = revealed && !isCorrect ? 0.38 : 1;

                  return (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      disabled={locked}
                      className="flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 active:scale-[0.99]"
                      style={{
                        borderColor: border,
                        background: tint,
                        opacity: dim,
                        minHeight: 52,
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <span
                        className="mt-px font-mono text-[11px]"
                        style={{
                          color: revealed && isCorrect ? BRAND.success : TEXT.tertiary,
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span
                        className="text-[14px] leading-snug sm:text-[15px]"
                        style={{ color: TEXT.primary }}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* analysing / insight */}
              <div className="mt-5 min-h-[44px]">
                <AnimatePresence mode="wait">
                  {analysing && (
                    <motion.div
                      key="an"
                      {...fade}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em]"
                      style={{ color: TEXT.tertiary }}
                    >
                      <motion.span
                        animate={{ opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                        className="inline-block h-1 w-1 rounded-full"
                        style={{ background: BRAND.logoBlue }}
                      />
                      {t.analysing}
                    </motion.div>
                  )}

                  {picked !== null && !analysing && (
                    <motion.div key="in" {...fade} transition={{ duration: 0.5, ease }}>
                      <p
                        className="border-l pl-3 text-[13px] leading-relaxed"
                        style={{ borderColor: TEXT.hairline, color: TEXT.secondary }}
                      >
                        {t.questions[qIndex].insight}
                      </p>
                      <button
                        onClick={advance}
                        className="mt-5 w-full rounded-full px-6 py-3.5 text-[14px] font-medium active:scale-[0.98] sm:w-auto"
                        style={{ background: BRAND.white, color: BRAND.void, minHeight: 48 }}
                      >
                        {qIndex < total - 1 ? "Continue" : "See result"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ---- interstitial ---- */}
          {stage === "interstitial" && (
            <motion.p
              key="inter"
              {...fade}
              transition={{ duration: 0.9, ease }}
              className="max-w-md text-center text-[16px] leading-relaxed sm:text-[19px]"
              style={{ color: TEXT.primary, letterSpacing: "-0.01em" }}
            >
              {t.interstitial}
            </motion.p>
          )}

          {/* ---- result ---- */}
          {stage === "result" && (
            <motion.div
              key="res"
              {...fade}
              transition={{ duration: 0.7, ease }}
              className="w-full max-w-md text-center"
              style={contentScrim}
            >
              <p
                className="font-mono text-[10px] tracking-[0.24em]"
                style={{ color: TEXT.tertiary }}
              >
                {t.resultEyebrow}
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                {answers.map((a, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease }}
                    className="h-1.5 rounded-full"
                    style={{
                      width: 34,
                      background: a ? BRAND.success : TEXT.hairline,
                    }}
                  />
                ))}
              </div>

              <p
                className="mt-3 font-mono text-[11px] tracking-[0.18em]"
                style={{ color: TEXT.secondary }}
              >
                {t.scoreLabel} {score}/{total}
              </p>

              <h2
                className="mt-6 text-[24px] font-medium leading-snug sm:text-[30px]"
                style={{ color: BRAND.white, letterSpacing: "-0.025em" }}
              >
                {score === total ? t.resultPerfect : t.resultPartial}
              </h2>

              <div
                className="mt-9 rounded-2xl border p-5 text-left"
                style={{
                  borderColor: TEXT.hairline,
                  background: "rgba(255,255,255,0.02)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-baseline justify-between">
                  <span
                    className="font-mono text-[9px] tracking-[0.2em]"
                    style={{ color: TEXT.tertiary }}
                  >
                    {t.invitationLabel}
                  </span>
                  <span
                    className="font-mono text-[9px] tracking-[0.14em]"
                    style={{ color: TEXT.tertiary }}
                  >
                    {invitationId}
                  </span>
                </div>
                <p
                  className="mt-2 text-[26px] font-semibold"
                  style={{ color: BRAND.white, letterSpacing: "-0.03em" }}
                >
                  {t.wordmark}
                </p>
                <p
                  className="mt-1 font-mono text-[10px] tracking-[0.14em]"
                  style={{ color: TEXT.secondary }}
                >
                  {t.issued} 19.08.2026 · DHAKA
                </p>
              </div>

              <button
                onClick={() => setArOpen(true)}
                className="mt-4 w-full rounded-full px-8 py-4 text-[15px] font-medium active:scale-[0.98]"
                style={{ background: BRAND.logoBlue, color: BRAND.void, minHeight: 52 }}
              >
                {t.arCta}
              </button>

              <button
                onClick={restart}
                className="mt-5 font-mono text-[10px] tracking-[0.18em] underline underline-offset-4"
                style={{ color: TEXT.tertiary, textDecorationColor: TEXT.hairline }}
              >
                {t.restart}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* footer */}
      <footer className="fixed inset-x-0 bottom-0 z-20 px-5 pb-3 sm:px-8 sm:pb-4">
        <p
          className="text-right font-mono text-[9px] tracking-[0.1em]"
          style={{ color: TEXT.tertiary }}
        >
          {t.footer}
        </p>
      </footer>

      {/* AR sheet */}
      <AnimatePresence>
        {arOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setArOpen(false)}
            style={{ background: "rgba(3,5,14,0.82)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ y: reduce ? 0 : 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reduce ? 0 : 30, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-3xl border p-6 sm:rounded-3xl"
              style={{ borderColor: TEXT.hairline, background: BRAND.surface }}
            >
              <p
                className="font-mono text-[10px] tracking-[0.2em]"
                style={{ color: TEXT.tertiary }}
              >
                CAMERA REQUIRED
              </p>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: TEXT.primary }}>
                Front-end preview. Connect your WebAR provider to the{" "}
                <code style={{ color: BRAND.logoBlue }}>onArOpen</code> handler to launch the
                live invitation.
              </p>
              <button
                onClick={() => setArOpen(false)}
                className="mt-6 w-full rounded-full border py-3 text-[14px]"
                style={{ borderColor: TEXT.hairline, color: TEXT.primary, minHeight: 48 }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
