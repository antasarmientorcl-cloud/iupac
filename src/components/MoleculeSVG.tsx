import React from "react";
import { MoleculeState, NamingResult } from "../types";
import { getSubstituentById } from "../lib/iupacEngine";

interface MoleculeSVGProps {
  state: MoleculeState;
  result?: NamingResult;
  showNumbers?: boolean;
  className?: string;
  interactive?: boolean;
}

export const MoleculeSVG: React.FC<MoleculeSVGProps> = ({
  state,
  result,
  showNumbers = true,
  className = "",
  interactive = true
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const n = Math.max(1, Math.min(state.chainLength, 12));
  const W = Math.max(560, n * 65 + 100);
  const H = 220;
  const startX = 60;
  const dx = (W - 120) / (n - 1 || 1);
  const baseY = 115;
  const amp = 30;

  // Calculate coordinates for carbons C1..Cn
  const pts = Array.from({ length: n }, (_, i) => {
    const x = startX + dx * i;
    const y = baseY + (i % 2 === 0 ? amp : -amp);
    return { x, y, index: i + 1 };
  });

  // Calculate perpendicular bond offsets for double/triple bonds
  const bondLine = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    offset: number,
    key: string,
    color = "#e2e8f0"
  ) => {
    const dxp = p2.x - p1.x;
    const dyp = p2.y - p1.y;
    const len = Math.hypot(dxp, dyp) || 1;
    const nx = -dyp / len;
    const ny = dxp / len;
    const ox = nx * offset;
    const oy = ny * offset;

    return (
      <line
        key={key}
        x1={p1.x + ox}
        y1={p1.y + oy}
        x2={p2.x + ox}
        y2={p2.y + oy}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className={`relative bg-[#121418] border border-white/10 rounded-lg p-3 shadow-md ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="carbonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Carbon Backbone Bonds */}
        {pts.map((p1, idx) => {
          if (idx === n - 1) return null;
          const p2 = pts[idx + 1];
          const carbonNum = idx + 1;
          const keyBase = `bond-${carbonNum}`;

          const isDouble =
            (state.unsat.type === "ene" && state.unsat.pos === carbonNum) ||
            (state.unsat.type === "diene" &&
              (state.unsat.pos === carbonNum || state.unsat.pos + 2 === carbonNum));

          const isTriple = state.unsat.type === "yne" && state.unsat.pos === carbonNum;

          if (isTriple) {
            return (
              <g key={keyBase}>
                {bondLine(p1, p2, -5, `${keyBase}-1`)}
                {bondLine(p1, p2, 0, `${keyBase}-2`)}
                {bondLine(p1, p2, 5, `${keyBase}-3`)}
              </g>
            );
          } else if (isDouble) {
            return (
              <g key={keyBase}>
                {bondLine(p1, p2, -3.5, `${keyBase}-1`)}
                {bondLine(p1, p2, 3.5, `${keyBase}-2`)}
              </g>
            );
          } else {
            return bondLine(p1, p2, 0, `${keyBase}-1`);
          }
        })}

        {/* Substituents */}
        {(state.substituents || []).map((s, sIdx) => {
          if (!s.id) return null;
          const idx = s.pos - 1;
          if (idx < 0 || idx >= n) return null;
          const p = pts[idx];
          const up = p.y > baseY ? -1 : 1;
          const stubY = p.y + up * 40;
          const def = getSubstituentById(s.id);
          const label = def ? def.sym : s.id;

          return (
            <g key={`sub-${sIdx}-${s.pos}`}>
              <line
                x1={p.x}
                y1={p.y}
                x2={p.x}
                y2={stubY}
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="none"
              />
              <circle cx={p.x} cy={stubY} r="3" fill="#f43f5e" />
              <text
                x={p.x}
                y={stubY + (up < 0 ? -10 : 18)}
                textAnchor="middle"
                className="font-mono-code font-bold text-xs"
                fill="#fb7185"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Principal Functional Group */}
        {(() => {
          const g = state.group;
          if (g.type === "none") return null;

          let idx = -1;
          let label = "";

          if (g.type === "al") {
            idx = 0;
            label = "CHO";
          } else if (g.type === "acid") {
            idx = 0;
            label = "COOH";
          } else if (g.type === "ol") {
            idx = g.pos - 1;
            label = "OH";
          } else if (g.type === "one") {
            idx = g.pos - 1;
            label = "=O";
          } else if (g.type === "amine") {
            idx = g.pos - 1;
            label = "NH2";
          } else if (g.type === "amide") {
            idx = 0;
            label = "CONH2";
          } else if (g.type === "nitrile") {
            idx = 0;
            label = "C≡N";
          }

          if (idx >= 0 && idx < n) {
            const p = pts[idx];
            const up = p.y > baseY ? -1 : 1;
            const stubY = p.y + up * 46;

            return (
              <g key="func-group">
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.x}
                  y2={stubY}
                  stroke="#f59e0b"
                  strokeWidth="3"
                />
                <rect
                  x={p.x - 24}
                  y={stubY + (up < 0 ? -22 : 2)}
                  width="48"
                  height="20"
                  rx="4"
                  fill="#1e232d"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <text
                  x={p.x}
                  y={stubY + (up < 0 ? -8 : 16)}
                  textAnchor="middle"
                  className="font-mono-code font-bold text-xs"
                  fill="#fbbf24"
                >
                  {label}
                </text>
              </g>
            );
          }
          return null;
        })()}

        {/* Carbon Atom Vertices & Locants */}
        {pts.map((p) => {
          const isHovered = hoveredIndex === p.index;
          const iupacLocant = result ? result.locantMap[p.index] : p.index;

          return (
            <g
              key={`vertex-${p.index}`}
              className="cursor-pointer"
              onMouseEnter={() => interactive && setHoveredIndex(p.index)}
              onMouseLeave={() => interactive && setHoveredIndex(null)}
            >
              {/* Carbon vertex circle */}
              {isHovered && (
                <circle cx={p.x} cy={p.y} r="14" fill="url(#carbonGlow)" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? "5" : "3.5"}
                fill={isHovered ? "#60a5fa" : "#3b82f6"}
                className="transition-all duration-150"
              />

              {/* Number Badges */}
              {showNumbers && (
                <g>
                  <circle
                    cx={p.x}
                    cy={p.y + (p.y > baseY ? 18 : -18)}
                    r="9"
                    fill={isHovered ? "#2563eb" : "#1e232d"}
                    stroke={isHovered ? "#60a5fa" : "#3b82f6"}
                    strokeWidth="1"
                  />
                  <text
                    x={p.x}
                    y={p.y + (p.y > baseY ? 21.5 : -14.5)}
                    textAnchor="middle"
                    className="font-mono-code font-bold text-[10px]"
                    fill={isHovered ? "#FFFFFF" : "#60a5fa"}
                  >
                    {iupacLocant}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend & Hover Info Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 mt-1 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Carbon Backbone
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Principal Group
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Substituent Branch
          </span>
        </div>

        {hoveredIndex !== null && (
          <span className="text-blue-300 font-semibold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
            Drawn C{hoveredIndex} &rarr; IUPAC Locant C
            {result ? result.locantMap[hoveredIndex] : hoveredIndex}
          </span>
        )}
      </div>
    </div>
  );
};
