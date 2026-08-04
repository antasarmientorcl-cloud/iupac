/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MoleculeState } from "./types";
import { computeIUPACName } from "./lib/iupacEngine";
import { Header } from "./components/Header";
import { MoleculeSVG } from "./components/MoleculeSVG";
import { MoleculeBuilder } from "./components/MoleculeBuilder";
import { NamingBreakdown } from "./components/NamingBreakdown";
import { MoleculeLibrary } from "./components/MoleculeLibrary";
import { QuizSection } from "./components/QuizSection";
import { ReferenceSection } from "./components/ReferenceSection";
import { AITutorModal } from "./components/AITutorModal";

export default function App() {
  const [activeTab, setActiveTab] = React.useState<
    "builder" | "quiz" | "reference" | "presets"
  >("builder");

  // Initial Molecule State: 4-chloro-3-methylhexan-1-ol demo
  const [moleculeState, setMoleculeState] = React.useState<MoleculeState>({
    chainLength: 6,
    group: { type: "ol", pos: 1 },
    unsat: { type: "none", pos: 1 },
    substituents: [
      { id: "chloro", pos: 3 },
      { id: "methyl", pos: 4 }
    ]
  });

  const [isAITutorOpen, setIsAITutorOpen] = React.useState(false);

  const namingResult = computeIUPACName(moleculeState);

  const handleReset = () => {
    setMoleculeState({
      chainLength: 6,
      group: { type: "ol", pos: 1 },
      unsat: { type: "none", pos: 1 },
      substituents: [
        { id: "chloro", pos: 3 },
        { id: "methyl", pos: 4 }
      ]
    });
  };

  const handleSelectPreset = (presetState: MoleculeState) => {
    setMoleculeState(presetState);
    setActiveTab("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-grid-paper pb-16">
      {/* Top Header & Carbon Ruler */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        state={moleculeState}
        result={namingResult}
        onOpenAITutor={() => setIsAITutorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {activeTab === "builder" && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Row: Builder Controls + Live 2D Skeletal Canvas & IUPAC Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <MoleculeBuilder
                state={moleculeState}
                onChangeState={setMoleculeState}
                onReset={handleReset}
              />

              <div className="space-y-6">
                {/* 2D Skeletal Molecular Diagram */}
                <div className="bg-[#16191f] border border-white/10 rounded-xl p-4 shadow-lg space-y-2 text-slate-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="font-serif-display font-bold text-lg text-white">
                      2D Skeletal Molecular Formula
                    </h3>
                    <span className="font-mono-code text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Live Interactive Canvas
                    </span>
                  </div>

                  <MoleculeSVG state={moleculeState} result={namingResult} />
                </div>

                {/* Step-by-Step Reasoning Breakdown */}
                <NamingBreakdown result={namingResult} state={moleculeState} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "presets" && (
          <MoleculeLibrary onSelectPreset={handleSelectPreset} />
        )}

        {activeTab === "quiz" && <QuizSection />}

        {activeTab === "reference" && <ReferenceSection />}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-white/10 text-xs font-mono-code text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          Nomenclature Notebook &bull; Organic Chemistry IUPAC Study Tool
        </div>
        <div>
          Designed according to standard IUPAC locant priority rules
        </div>
      </footer>

      {/* AI Chemistry Assistant Modal */}
      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        moleculeState={moleculeState}
        namingResult={namingResult}
      />
    </div>
  );
}
