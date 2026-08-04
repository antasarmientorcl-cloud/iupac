import React from "react";
import { PRESET_MOLECULARS } from "../lib/iupacEngine";
import { PresetMolecule, MoleculeState } from "../types";
import { MoleculeSVG } from "./MoleculeSVG";
import { computeIUPACName } from "../lib/iupacEngine";
import { exportAllLibraryAsHTML } from "../lib/exportHtml";
import { Library, ArrowRight, Tag, Download } from "lucide-react";

interface MoleculeLibraryProps {
  onSelectPreset: (state: MoleculeState) => void;
}

export const MoleculeLibrary: React.FC<MoleculeLibraryProps> = ({ onSelectPreset }) => {
  const [selectedTag, setSelectedTag] = React.useState<string>("All");

  const allTags = ["All", ...Array.from(new Set(PRESET_MOLECULARS.flatMap((p) => p.tags)))];

  const filtered = selectedTag === "All"
    ? PRESET_MOLECULARS
    : PRESET_MOLECULARS.filter((p) => p.tags.includes(selectedTag));

  return (
    <div className="bg-[#16191f] border border-white/10 rounded-xl p-5 shadow-lg space-y-5 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif-display font-bold text-2xl text-white flex items-center gap-2">
              <Library className="w-6 h-6 text-blue-400" />
              Preset Molecule Library
            </h2>
            <button
              onClick={exportAllLibraryAsHTML}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code font-medium bg-emerald-600/90 text-white hover:bg-emerald-500 transition shadow-xs cursor-pointer"
              title="Download all preset molecules & rules as a single master HTML workbook"
            >
              <Download className="w-3.5 h-3.5" />
              Export Entire Library (HTML)
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore foundational organic chemistry structures, functional groups, and real-world compounds.
          </p>
        </div>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-mono-code transition cursor-pointer ${
                selectedTag === tag
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((preset) => {
          const result = computeIUPACName(preset.state);

          return (
            <div
              key={preset.id}
              className="bg-[#121418] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif-display font-bold text-lg text-white">
                      {preset.commonName || preset.name}
                    </h3>
                    <div className="font-mono-code text-xs font-bold text-blue-400">
                      IUPAC: {result.name}
                    </div>
                  </div>

                  <span className="font-mono-code text-[11px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 shrink-0">
                    {result.formula}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {preset.description}
                </p>

                {/* Diagram Preview */}
                <MoleculeSVG
                  state={preset.state}
                  result={result}
                  interactive={false}
                  showNumbers={true}
                  className="bg-[#0f1115]"
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {preset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] font-mono-code text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5"
                    >
                      <Tag className="w-2.5 h-2.5 text-blue-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectPreset(preset.state)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-mono-code text-xs font-medium rounded-md transition shadow-sm cursor-pointer"
              >
                Load into Builder & Dissect
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
