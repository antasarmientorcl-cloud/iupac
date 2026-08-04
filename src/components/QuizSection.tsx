import React from "react";
import { MoleculeState, NamingResult } from "../types";
import { computeIUPACName, SUBSTITUENTS } from "../lib/iupacEngine";
import { MoleculeSVG } from "./MoleculeSVG";
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Eye, Award, Sparkles } from "lucide-react";

export const QuizSection: React.FC = () => {
  const [difficulty, setDifficulty] = React.useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [currentQuiz, setCurrentQuiz] = React.useState<MoleculeState | null>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);
  const [score, setScore] = React.useState({ correct: 0, total: 0, streak: 0 });

  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom<T>(arr: T[]): T {
    return arr[getRandomInt(0, arr.length - 1)];
  }

  const generateQuizMolecule = React.useCallback(() => {
    let n = 4;
    let groupType: any = "none";
    let unsatType: any = "none";
    const subs: { id: string; pos: number }[] = [];

    if (difficulty === "beginner") {
      n = getRandomInt(3, 6);
      groupType = pickRandom(["none", "ol", "al"]);
      if (groupType === "none" && getRandomInt(0, 1) === 1) {
        unsatType = pickRandom(["ene", "yne"]);
      }
      if (getRandomInt(0, 1) === 1) {
        subs.push({
          id: pickRandom(["methyl", "chloro", "bromo"]),
          pos: getRandomInt(1, n)
        });
      }
    } else if (difficulty === "intermediate") {
      n = getRandomInt(4, 8);
      groupType = pickRandom(["ol", "al", "one", "acid", "amine"]);
      if (getRandomInt(0, 2) === 1) {
        unsatType = pickRandom(["ene", "yne"]);
      }
      const numSubs = getRandomInt(1, 2);
      const usedPos = new Set<number>();
      for (let i = 0; i < numSubs; i++) {
        let pos = getRandomInt(1, n);
        let tries = 0;
        while (usedPos.has(pos) && tries < 10) {
          pos = getRandomInt(1, n);
          tries++;
        }
        usedPos.add(pos);
        subs.push({
          id: pickRandom(["methyl", "ethyl", "chloro", "bromo", "fluoro"]),
          pos
        });
      }
    } else {
      // Advanced
      n = getRandomInt(5, 9);
      groupType = pickRandom(["ol", "one", "acid", "al", "amine", "amide"]);
      unsatType = pickRandom(["none", "ene", "yne", "diene"]);
      const numSubs = getRandomInt(2, 3);
      for (let i = 0; i < numSubs; i++) {
        subs.push({
          id: pickRandom(["methyl", "ethyl", "isopropyl", "chloro", "bromo", "nitro", "hydroxy"]),
          pos: getRandomInt(1, n)
        });
      }
    }

    let gPos = 1;
    if (groupType === "ol" || groupType === "amine") gPos = getRandomInt(1, n);
    if (groupType === "one") gPos = getRandomInt(2, Math.max(2, n - 1));

    let uPos = 1;
    if (unsatType !== "none") uPos = getRandomInt(1, Math.max(1, n - 1));

    const state: MoleculeState = {
      chainLength: n,
      group: { type: groupType, pos: gPos },
      unsat: { type: unsatType, pos: uPos },
      substituents: subs
    };

    setCurrentQuiz(state);
    setUserAnswer("");
    setSubmitted(false);
  }, [difficulty]);

  React.useEffect(() => {
    generateQuizMolecule();
  }, [generateQuizMolecule]);

  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[\,\-]/g, "");
  };

  const handleCheckAnswer = () => {
    if (!currentQuiz || !userAnswer.trim()) return;
    const result = computeIUPACName(currentQuiz);
    const correct = normalize(userAnswer) === normalize(result.name);

    setIsCorrect(correct);
    setSubmitted(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      streak: correct ? prev.streak + 1 : 0
    }));
  };

  const handleRevealAnswer = () => {
    if (!currentQuiz) return;
    setIsCorrect(false);
    setSubmitted(true);
  };

  const currentResult = currentQuiz ? computeIUPACName(currentQuiz) : null;

  return (
    <div className="bg-[#16191f] border border-white/10 rounded-xl p-5 shadow-lg space-y-5 text-slate-200">
      {/* Quiz Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          <h2 className="font-serif-display font-bold text-2xl text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-400" />
            IUPAC Practice & Quiz Suite
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test your nomenclature skills on generated structures. Locants, commas, and hyphens matter!
          </p>
        </div>

        {/* Difficulty buttons */}
        <div className="flex items-center gap-1.5 bg-[#121418] p-1 rounded-lg border border-white/10">
          {(["beginner", "intermediate", "advanced"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-2.5 py-1 text-xs font-mono-code rounded transition capitalize cursor-pointer ${
                difficulty === diff
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Score Tracker */}
      <div className="flex items-center justify-between bg-[#121418] border border-white/10 rounded-lg px-4 py-2.5 font-mono-code text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Score:</span>
          <span className="font-bold text-blue-400">
            {score.correct} / {score.total}
          </span>
          {score.total > 0 && (
            <span className="text-slate-500">
              ({Math.round((score.correct / score.total) * 100)}%)
            </span>
          )}
        </div>

        <div className="text-blue-400 font-semibold">
          Streak: {score.streak} 🔥
        </div>
      </div>

      {/* Question Card */}
      {currentQuiz && currentResult && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code text-slate-400 uppercase font-bold tracking-wider">
                Question Structure
              </span>
              <span className="text-xs font-mono-code text-blue-400">
                Formula: {currentResult.formula}
              </span>
            </div>

            <MoleculeSVG
              state={currentQuiz}
              result={currentResult}
              showNumbers={true}
              interactive={true}
              className="bg-[#0f1115] border border-white/10"
            />
          </div>

          {/* User Input & Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Type the Full IUPAC Name:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheckAnswer()}
                disabled={submitted}
                placeholder="e.g. 4-chloro-3-methylhexan-2-ol"
                className="flex-1 px-3 py-2 bg-[#1e232d] border border-white/10 rounded-md font-mono-code text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />

              <button
                onClick={handleCheckAnswer}
                disabled={submitted || !userAnswer.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono-code text-xs font-bold rounded-md transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Check Answer
              </button>

              <button
                onClick={handleRevealAnswer}
                disabled={submitted}
                className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-mono-code text-xs rounded-md transition flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Reveal
              </button>

              <button
                onClick={generateQuizMolecule}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono-code text-xs rounded-md transition flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Next Question
              </button>
            </div>
          </div>

          {/* Answer & Explanation Feedback */}
          {submitted && (
            <div
              className={`p-4 rounded-lg border ${
                isCorrect
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/50 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2 font-mono-code font-bold text-sm mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Correct! Outstanding IUPAC Naming!
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    Incorrect or Revealed. Correct Name:{" "}
                    <span className="underline font-extrabold text-white">{currentResult.name}</span>
                  </>
                )}
              </div>

              <div className="space-y-1.5 text-xs font-sans mt-3 border-t border-current/20 pt-2">
                <div className="font-mono-code font-bold uppercase text-[11px] tracking-wider mb-1">
                  Locant & Priority Resolution:
                </div>
                {currentResult.breakdown.map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="font-mono-code font-bold">&bull; {b.title}:</span>
                    <span>{b.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
