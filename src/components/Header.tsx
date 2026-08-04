import React from "react";
import { MoleculeState, NamingResult } from "../types";
import { Sparkles, BookOpen, HelpCircle, Compass, Library, Copy, Check, Download } from "lucide-react";
import { exportMoleculeAsHTML } from "../lib/exportHtml";

interface HeaderProps {
  activeTab: "builder" | "quiz" | "reference" | "presets";
  setActiveTab: (tab: "builder" | "quiz" | "reference" | "presets") => void;
  state: MoleculeState;
  result: NamingResult;
  onOpenAITutor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  state,
  result,
  onOpenAITutor
}) => {
  const [copied, setCopied] = React.useState(false);

  const activePositions = new Set<number>();
  if (state.group.type !== "none") {
    if (state.group.type === "al" || state.group.type === "acid" || state.group.type === "nitrile") {
      activePositions.add(1);
    } else {
      activePositions.add(state.group.pos);
    }
  }
  if (state.unsat.type !== "none") {
    activePositions.add(state.unsat.pos);
    activePositions.add(state.unsat.pos + 1);
  }
  state.substituents.forEach((s) => activePositions.add(s.pos));

  const handleCopyName = () => {
    navigator.clipboard.writeText(result.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="max-w-6xl mx-auto px-4 pt-8 pb-4 border-b border-white/10 bg-[#16191f]/40 rounded-b-xl backdrop-blur-xs">
      {/* Top Bar / Kicker */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="font-mono-code text-xs font-semibold tracking-wider text-blue-400 uppercase flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
          Organic Chemistry &middot; Interactive IUPAC Lab
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAITutor}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono-code font-medium bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            Ask AI Chem Tutor
          </button>

          <button
            onClick={handleCopyName}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono-code text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition shadow-xs cursor-pointer"
            title="Copy current IUPAC name"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Name"}
          </button>

          <button
            onClick={() => exportMoleculeAsHTML(state, result)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono-code font-medium bg-emerald-600/90 text-white hover:bg-emerald-500 transition shadow-sm cursor-pointer"
            title="Download full standalone HTML report"
          >
            <Download className="w-3.5 h-3.5" />
            Save as HTML
          </button>
        </div>
      </div>

      {/* Main Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="font-serif-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white leading-tight tracking-wide">
            Nomenclature <em className="not-italic text-blue-400 border-b-4 border-blue-500">Notebook</em>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mt-2 leading-relaxed">
            Construct acyclic carbon skeletons, watch locant direction rules resolve live, and get detailed IUPAC naming breakdowns with 2D skeletal diagrams.
          </p>
        </div>

        <div className="flex flex-col items-end justify-end shrink-0 font-mono-code text-xs text-slate-400">
          <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Current Parent</span>
          <span className="text-lg font-bold text-white">{state.chainLength} Carbon Chain</span>
          <span className="text-xs text-blue-300">{result.formula} &bull; {result.molecularWeight} g/mol</span>
        </div>
      </div>

      {/* Carbon Chain Ruler Signature */}
      <div className="mt-4 mb-6 pt-2 border-t border-dashed border-white/10">
        <div className="text-[11px] font-mono-code text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Carbon Backbone Locant Ruler (Left-to-Right Drawn Positions)</span>
          {result.reverse && (
            <span className="text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Direction Flipped in IUPAC Name (Right-to-Left)
            </span>
          )}
        </div>
        <div className="flex items-end gap-1 overflow-x-auto pb-2">
          {Array.from({ length: state.chainLength }, (_, idx) => {
            const carbonIndex = idx + 1;
            const isActive = activePositions.has(carbonIndex);
            const iupacLocant = result.locantMap[carbonIndex];

            return (
              <div
                key={carbonIndex}
                className={`flex flex-col items-center min-w-[36px] flex-1 transition-all ${
                  isActive ? "scale-105" : ""
                }`}
              >
                <div
                  className={`w-0.5 transition-all ${
                    isActive
                      ? "h-6 bg-blue-500 w-1 shadow-sm shadow-blue-500/50"
                      : "h-3.5 bg-white/20"
                  }`}
                />
                <span
                  className={`font-mono-code text-xs mt-1 transition-colors ${
                    isActive
                      ? "text-blue-400 font-bold"
                      : "text-slate-500"
                  }`}
                >
                  C{carbonIndex}
                </span>
                <span className="text-[10px] font-mono-code text-slate-400 opacity-75">
                  ({iupacLocant})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex gap-2 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex items-center gap-2 font-mono-code text-xs sm:text-sm px-4 py-2.5 rounded-t-md transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "builder"
              ? "text-white border-blue-500 bg-[#1e232d] font-bold shadow-xs"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4 text-blue-400" />
          Molecule Builder
        </button>

        <button
          onClick={() => setActiveTab("presets")}
          className={`flex items-center gap-2 font-mono-code text-xs sm:text-sm px-4 py-2.5 rounded-t-md transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "presets"
              ? "text-white border-blue-500 bg-[#1e232d] font-bold shadow-xs"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
        >
          <Library className="w-4 h-4 text-blue-400" />
          Molecule Library
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 font-mono-code text-xs sm:text-sm px-4 py-2.5 rounded-t-md transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "quiz"
              ? "text-white border-blue-500 bg-[#1e232d] font-bold shadow-xs"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-blue-400" />
          Quiz & Practice
        </button>

        <button
          onClick={() => setActiveTab("reference")}
          className={`flex items-center gap-2 font-mono-code text-xs sm:text-sm px-4 py-2.5 rounded-t-md transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "reference"
              ? "text-white border-blue-500 bg-[#1e232d] font-bold shadow-xs"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          IUPAC Rules Reference
        </button>
      </nav>
    </header>
  );
};
