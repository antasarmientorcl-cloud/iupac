import React from "react";
import { MoleculeState, FunctionalGroupType, UnsaturationType } from "../types";
import { SUBSTITUENTS, ROOTS } from "../lib/iupacEngine";
import { Plus, Trash2, Sliders, Layers, Sparkles } from "lucide-react";

interface MoleculeBuilderProps {
  state: MoleculeState;
  onChangeState: (newState: MoleculeState) => void;
  onReset: () => void;
}

export const MoleculeBuilder: React.FC<MoleculeBuilderProps> = ({
  state,
  onChangeState,
  onReset
}) => {
  const handleChainLengthChange = (length: number) => {
    const n = Math.max(1, Math.min(length, 12));
    onChangeState({
      ...state,
      chainLength: n,
      group: {
        ...state.group,
        pos: Math.min(state.group.pos, n)
      },
      unsat: {
        ...state.unsat,
        pos: Math.min(state.unsat.pos, Math.max(1, n - 1))
      },
      substituents: state.substituents.map((s) => ({
        ...s,
        pos: Math.min(s.pos, n)
      }))
    });
  };

  const handleGroupTypeChange = (type: FunctionalGroupType) => {
    onChangeState({
      ...state,
      group: {
        ...state.group,
        type,
        pos: type === "al" || type === "acid" || type === "amide" || type === "nitrile" ? 1 : state.group.pos
      }
    });
  };

  const handleGroupPosChange = (pos: number) => {
    const validPos = Math.max(1, Math.min(pos, state.chainLength));
    onChangeState({
      ...state,
      group: {
        ...state.group,
        pos: validPos
      }
    });
  };

  const handleUnsatTypeChange = (type: UnsaturationType) => {
    onChangeState({
      ...state,
      unsat: {
        ...state.unsat,
        type,
        pos: Math.min(state.unsat.pos, Math.max(1, state.chainLength - 1))
      }
    });
  };

  const handleUnsatPosChange = (pos: number) => {
    const validPos = Math.max(1, Math.min(pos, Math.max(1, state.chainLength - 1)));
    onChangeState({
      ...state,
      unsat: {
        ...state.unsat,
        pos: validPos
      }
    });
  };

  const handleAddSubstituent = () => {
    onChangeState({
      ...state,
      substituents: [
        ...state.substituents,
        { id: "methyl", pos: Math.min(2, state.chainLength) }
      ]
    });
  };

  const handleRemoveSubstituent = (index: number) => {
    const updated = [...state.substituents];
    updated.splice(index, 1);
    onChangeState({
      ...state,
      substituents: updated
    });
  };

  const handleUpdateSubstituent = (
    index: number,
    field: "id" | "pos",
    value: string | number
  ) => {
    const updated = [...state.substituents];
    if (field === "id") {
      updated[index].id = value as string;
    } else {
      updated[index].pos = Math.max(1, Math.min(Number(value), state.chainLength));
    }
    onChangeState({
      ...state,
      substituents: updated
    });
  };

  const isTerminalGroup =
    state.group.type === "al" ||
    state.group.type === "acid" ||
    state.group.type === "amide" ||
    state.group.type === "nitrile";

  return (
    <div className="bg-[#16191f] border border-white/10 rounded-xl p-5 shadow-lg space-y-5 text-slate-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="font-serif-display font-bold text-xl text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          Structure Controls
        </h2>
        <button
          onClick={onReset}
          className="text-xs font-mono-code text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
        >
          Reset to Baseline
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Positions are initially numbered 1..n from left to right as drawn. The IUPAC engine automatically tests and flips the numbering direction if needed to achieve lowest locants.
      </p>

      {/* Row 1: Parent Chain & Principal Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chain Length */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Parent Chain Length
          </label>
          <select
            value={state.chainLength}
            onChange={(e) => handleChainLengthChange(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#1e232d] border border-white/10 rounded-md font-mono-code text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((len) => (
              <option key={len} value={len} className="bg-[#16191f] text-white">
                {len} Carbon{len > 1 ? "s" : ""} — {ROOTS[len]}
                {len === 1 ? "ane (Methane)" : "ane"}
              </option>
            ))}
          </select>
        </div>

        {/* Principal Functional Group */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Principal Group (Suffix)
          </label>
          <select
            value={state.group.type}
            onChange={(e) => handleGroupTypeChange(e.target.value as FunctionalGroupType)}
            className="w-full px-3 py-2 bg-[#1e232d] border border-white/10 rounded-md font-mono-code text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="none" className="bg-[#16191f] text-white">None — Plain Hydrocarbon</option>
            <option value="acid" className="bg-[#16191f] text-white">Carboxylic Acid (-oic acid)</option>
            <option value="al" className="bg-[#16191f] text-white">Aldehyde (-al)</option>
            <option value="one" className="bg-[#16191f] text-white">Ketone (-one)</option>
            <option value="ol" className="bg-[#16191f] text-white">Alcohol (-ol)</option>
            <option value="amine" className="bg-[#16191f] text-white">Amine (-amine)</option>
            <option value="amide" className="bg-[#16191f] text-white">Amide (-amide)</option>
            <option value="nitrile" className="bg-[#16191f] text-white">Nitrile (-nitrile)</option>
            <option value="ether" className="bg-[#16191f] text-white">Ether (-oxy)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Group Position & Unsaturation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Functional Group Position */}
        {!isTerminalGroup && state.group.type !== "none" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Principal Group Position (Drawn C)
            </label>
            <input
              type="number"
              min={1}
              max={state.chainLength}
              value={state.group.pos}
              onChange={(e) => handleGroupPosChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#1e232d] border border-white/10 rounded-md font-mono-code text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Unsaturation Type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Unsaturation (Infix)
          </label>
          <select
            value={state.unsat.type}
            onChange={(e) => handleUnsatTypeChange(e.target.value as UnsaturationType)}
            className="w-full px-3 py-2 bg-[#1e232d] border border-white/10 rounded-md font-mono-code text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="none" className="bg-[#16191f] text-white">None — All Single Bonds (-an-)</option>
            <option value="ene" className="bg-[#16191f] text-white">Double Bond (-ene)</option>
            <option value="yne" className="bg-[#16191f] text-white">Triple Bond (-yne)</option>
            <option value="diene" className="bg-[#16191f] text-white">Two Double Bonds (-diene)</option>
          </select>
        </div>

        {/* Unsaturation Position */}
        {state.unsat.type !== "none" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Bond Starts at Carbon (C)
            </label>
            <input
              type="number"
              min={1}
              max={Math.max(1, state.chainLength - 1)}
              value={state.unsat.pos}
              onChange={(e) => handleUnsatPosChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#1e232d] border border-white/10 rounded-md font-mono-code text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Row 3: Substituents */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Substituents & Branches ({state.substituents.length})
          </label>

          <button
            onClick={handleAddSubstituent}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono-code text-blue-400 border border-blue-500/40 rounded-md hover:bg-blue-600 hover:text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Substituent
          </button>
        </div>

        {state.substituents.length === 0 ? (
          <div className="text-center py-4 bg-[#121418] border border-dashed border-white/10 rounded-md text-xs font-mono-code text-slate-400">
            No substituents added yet. Click "+ Add Substituent" to attach methyl, halo, or nitro groups.
          </div>
        ) : (
          <div className="space-y-2">
            {state.substituents.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-[#121418] border border-white/10 rounded-md shadow-2xs"
              >
                <div className="flex-1">
                  <select
                    value={sub.id}
                    onChange={(e) => handleUpdateSubstituent(idx, "id", e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#1e232d] border border-white/10 rounded font-mono-code text-xs text-white"
                  >
                    {SUBSTITUENTS.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#16191f] text-white">
                        {s.name} ({s.sym})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min={1}
                    max={state.chainLength}
                    value={sub.pos}
                    onChange={(e) => handleUpdateSubstituent(idx, "pos", Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-[#1e232d] border border-white/10 rounded font-mono-code text-xs text-center text-white"
                    title="Position on Carbon Chain"
                  />
                </div>

                <button
                  onClick={() => handleRemoveSubstituent(idx)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                  title="Remove substituent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
