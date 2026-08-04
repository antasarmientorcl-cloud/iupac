import React from "react";
import { MoleculeState, NamingResult } from "../types";
import { Copy, Check, FileText, CheckCircle2, Download } from "lucide-react";
import { exportMoleculeAsHTML } from "../lib/exportHtml";

interface NamingBreakdownProps {
  result: NamingResult;
  state?: MoleculeState;
}

export const NamingBreakdown: React.FC<NamingBreakdownProps> = ({ result, state }) => {
  const [copiedName, setCopiedName] = React.useState(false);
  const [copiedBreakdown, setCopiedBreakdown] = React.useState(false);

  const handleCopyName = () => {
    navigator.clipboard.writeText(result.name);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
  };

  const handleCopyBreakdownText = () => {
    const text = `IUPAC Name: ${result.name}\nFormula: ${result.formula} (${result.molecularWeight} g/mol)\n\nBreakdown:\n` +
      result.breakdown.map((b) => `• ${b.title}: ${b.detail}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedBreakdown(true);
    setTimeout(() => setCopiedBreakdown(false), 2000);
  };

  return (
    <div className="bg-[#16191f] border border-white/10 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="font-serif-display font-bold text-xl text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          IUPAC Name & Reasoning
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyBreakdownText}
            className="flex items-center gap-1 text-xs font-mono-code text-blue-400 hover:underline cursor-pointer"
          >
            {copiedBreakdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedBreakdown ? "Copied All" : "Copy Breakdown"}
          </button>

          {state && (
            <button
              onClick={() => exportMoleculeAsHTML(state, result)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono-code bg-emerald-600/90 hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer"
              title="Download standalone HTML report"
            >
              <Download className="w-3.5 h-3.5" />
              Save as HTML
            </button>
          )}
        </div>
      </div>

      {/* Main IUPAC Name Display Box */}
      <div className="bg-[#1e2d42] border-2 border-blue-500 rounded-xl p-5 text-center shadow-lg relative group">
        <div className="font-mono-code font-extrabold text-xl sm:text-2xl md:text-3xl text-blue-300 break-all tracking-tight drop-shadow-sm">
          {result.name}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="font-mono-code text-xs px-2.5 py-0.5 rounded-full bg-[#16191f]/80 border border-blue-500/30 text-slate-200 font-semibold">
            Formula: {result.formula}
          </span>
          <span className="font-mono-code text-xs px-2.5 py-0.5 rounded-full bg-[#16191f]/80 border border-blue-500/30 text-slate-200 font-semibold">
            MW: {result.molecularWeight} g/mol
          </span>
        </div>

        <button
          onClick={handleCopyName}
          className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md shadow-xs transition cursor-pointer"
          title="Copy IUPAC Name"
        >
          {copiedName ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Step-by-step logic breakdown */}
      <div className="space-y-3 pt-2">
        <h3 className="font-mono-code text-xs font-bold uppercase tracking-wider text-slate-400">
          Step-by-step Rule Resolution
        </h3>

        <div className="space-y-2.5 text-xs text-slate-200">
          {result.breakdown.map((step, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#121418] border border-white/10 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-2 shadow-2xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold font-mono-code text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {step.title}
                </div>
                <p className="text-slate-300 leading-relaxed pl-5">
                  {step.detail}
                </p>
              </div>

              {step.chip && (
                <span className="shrink-0 font-mono-code font-bold text-xs bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded border border-blue-500/20 self-start sm:self-center">
                  {step.chip}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
