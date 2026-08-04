import React from "react";
import { ROOTS, SUBSTITUENTS } from "../lib/iupacEngine";
import { BookOpen, Check, ListOrdered, Table, AlertTriangle } from "lucide-react";

export const ReferenceSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 5-Step IUPAC Algorithm */}
      <div className="bg-[#16191f] border border-white/10 rounded-xl p-5 shadow-lg space-y-4 text-slate-200">
        <h2 className="font-serif-display font-bold text-2xl text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <ListOrdered className="w-6 h-6 text-blue-400" />
          Standard IUPAC Naming Procedure
        </h2>

        <ol className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <li className="p-3 bg-[#121418] border border-white/10 rounded-lg shadow-sm">
            <b className="text-blue-400 font-mono-code font-bold text-sm block mb-1">
              1. Identify the Parent Chain
            </b>
            Find the longest continuous carbon chain containing the principal functional group (or maximum number of multiple bonds if no principal group is present).
          </li>

          <li className="p-3 bg-[#121418] border border-white/10 rounded-lg shadow-sm">
            <b className="text-blue-400 font-mono-code font-bold text-sm block mb-1">
              2. Determine the Principal Group & Suffix
            </b>
            Identify the highest priority functional group present. It becomes the principal suffix (e.g., -ol, -oic acid). All other functional groups are named as prefixes.
          </li>

          <li className="p-3 bg-[#121418] border border-white/10 rounded-lg shadow-sm">
            <b className="text-blue-400 font-mono-code font-bold text-sm block mb-1">
              3. Number the Parent Chain (Locants)
            </b>
            Number from the end that gives:
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400 font-mono-code text-xs">
              <li>Lowest locant for the principal functional group</li>
              <li>Lowest locants for unsaturations (-ene/-yne)</li>
              <li>Lowest set of locants at the first point of difference for substituents</li>
              <li>Alphabetical priority if locants are otherwise identical in both directions</li>
            </ul>
          </li>

          <li className="p-3 bg-[#121418] border border-white/10 rounded-lg shadow-sm">
            <b className="text-blue-400 font-mono-code font-bold text-sm block mb-1">
              4. Name & Alphabetize Substituents
            </b>
            Arrange substituent prefixes in strict alphabetical order (e.g., <b>e</b>thyl before <b>m</b>ethyl). Ignore multiplier prefixes like <i>di-</i>, <i>tri-</i>, <i>tetra-</i> when alphabetizing, but DO include <i>iso-</i> and <i>cyclo-</i>.
          </li>

          <li className="p-3 bg-[#121418] border border-white/10 rounded-lg shadow-sm">
            <b className="text-blue-400 font-mono-code font-bold text-sm block mb-1">
              5. Assemble the IUPAC Name
            </b>
            Fuse: <code className="bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-300 font-bold border border-blue-500/20">[Prefixes]-[Root][Infix][Suffix]</code>.
            Use hyphens between numbers and letters, commas between numbers. Drop terminal 'e' before vowels (e.g., hexan-1-ol).
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Table */}
        <div className="bg-[#16191f] border border-white/10 rounded-xl p-5 shadow-lg space-y-3 text-slate-200">
          <h3 className="font-serif-display font-bold text-xl text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Table className="w-5 h-5 text-blue-400" />
            Functional Group Suffix Priority (Highest First)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 font-mono-code text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-2">Group</th>
                  <th className="py-2 px-2">Suffix</th>
                  <th className="py-2 px-2">Prefix (if secondary)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono-code">
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Carboxylic Acid</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-oic acid</td>
                  <td className="py-2 px-2 text-slate-400">carboxy-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Ester</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-oate</td>
                  <td className="py-2 px-2 text-slate-400">alkoxycarbonyl-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Amide</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-amide</td>
                  <td className="py-2 px-2 text-slate-400">carbamoyl-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Nitrile</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-nitrile</td>
                  <td className="py-2 px-2 text-slate-400">cyano-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Aldehyde</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-al</td>
                  <td className="py-2 px-2 text-slate-400">oxo- / formyl-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Ketone</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-one</td>
                  <td className="py-2 px-2 text-slate-400">oxo-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Alcohol</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-ol</td>
                  <td className="py-2 px-2 text-slate-400">hydroxy-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Amine</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-amine</td>
                  <td className="py-2 px-2 text-slate-400">amino-</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Alkene</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-ene</td>
                  <td className="py-2 px-2 text-slate-400">(Infix)</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold text-white">Alkyne</td>
                  <td className="py-2 px-2 text-blue-400 font-bold">-yne</td>
                  <td className="py-2 px-2 text-slate-400">(Infix)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Carbon Root Prefixes */}
        <div className="bg-[#16191f] border border-white/10 rounded-xl p-5 shadow-lg space-y-3 text-slate-200">
          <h3 className="font-serif-display font-bold text-xl text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Carbon Root Prefixes (1 – 12)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 font-mono-code text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-2">Carbons</th>
                  <th className="py-2 px-2">Root</th>
                  <th className="py-2 px-2">Alkane Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono-code">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <tr key={num}>
                    <td className="py-1.5 px-2 font-bold text-amber-400">C{num}</td>
                    <td className="py-1.5 px-2 font-bold text-blue-400">{ROOTS[num]}-</td>
                    <td className="py-1.5 px-2 text-white">{ROOTS[num]}ane</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
