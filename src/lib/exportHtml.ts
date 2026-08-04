import { MoleculeState, NamingResult } from "../types";
import { SUBSTITUENTS, PRESET_MOLECULARS, computeIUPACName } from "./iupacEngine";

/**
 * Generates an SVG string representation of the 2D skeletal structure
 * for inclusion in the exported HTML report.
 */
function generateSkeletalSVG(state: MoleculeState, result: NamingResult): string {
  const n = Math.max(1, Math.min(12, state.chainLength));
  const W = 600;
  const H = 280;
  const paddingX = 70;
  const dx = n > 1 ? (W - 2 * paddingX) / (n - 1) : 0;
  const baseY = 140;
  const amplitude = 32;

  const getPos = (i: number) => {
    if (n === 1) return { x: W / 2, y: baseY };
    const x = paddingX + (i - 1) * dx;
    const y = baseY + (i % 2 === 1 ? -amplitude : amplitude);
    return { x, y };
  };

  const points = Array.from({ length: n }, (_, i) => getPos(i + 1));

  let pathsHTML = "";
  // Backbone single bonds
  for (let i = 0; i < n - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    pathsHTML += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="3" stroke-linecap="round"/>`;
  }

  // Unsaturation
  if (state.unsat.type !== "none") {
    const startIdx = Math.max(1, Math.min(n - 1, state.unsat.pos)) - 1;
    const p1 = points[startIdx];
    const p2 = points[startIdx + 1];

    if (state.unsat.type === "ene" || state.unsat.type === "diene") {
      const dxp = p2.x - p1.x;
      const dyp = p2.y - p1.y;
      const len = Math.hypot(dxp, dyp) || 1;
      const nx = -dyp / len;
      const ny = dxp / len;
      const off = 5;
      pathsHTML += `<line x1="${p1.x + nx * off}" y1="${p1.y + ny * off}" x2="${p2.x + nx * off}" y2="${p2.y + ny * off}" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>`;
    } else if (state.unsat.type === "yne") {
      const dxp = p2.x - p1.x;
      const dyp = p2.y - p1.y;
      const len = Math.hypot(dxp, dyp) || 1;
      const nx = -dyp / len;
      const ny = dxp / len;
      const off = 5;
      pathsHTML += `<line x1="${p1.x + nx * off}" y1="${p1.y + ny * off}" x2="${p2.x + nx * off}" y2="${p2.y + ny * off}" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>`;
      pathsHTML += `<line x1="${p1.x - nx * off}" y1="${p1.y - ny * off}" x2="${p2.x - nx * off}" y2="${p2.y - ny * off}" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>`;
    }
  }

  // Substituents
  state.substituents.forEach((sub) => {
    const pos = Math.max(1, Math.min(n, sub.pos));
    const p = getPos(pos);
    const subDef = SUBSTITUENTS.find((s) => s.id === sub.id);
    const label = subDef ? subDef.sym : sub.id;

    const up = pos % 2 === 1 ? -1 : 1;
    const stubY = p.y + up * 45;

    pathsHTML += `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${stubY}" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="3 3"/>`;
    pathsHTML += `<circle cx="${p.x}" cy="${stubY}" r="3" fill="#f43f5e"/>`;
    pathsHTML += `<text x="${p.x}" y="${stubY + (up < 0 ? -10 : 18)}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12px" fill="#fb7185">${label}</text>`;
  });

  // Principal Group
  if (state.group.type !== "none") {
    const pos = Math.max(1, Math.min(n, state.group.pos));
    const p = getPos(pos);
    const up = pos % 2 === 1 ? -1 : 1;
    const stubY = p.y + up * 45;

    let label: string = state.group.type;
    if (state.group.type === "acid") label = "COOH";
    else if (state.group.type === "al") label = "CHO";
    else if (state.group.type === "one") label = "=O";
    else if (state.group.type === "ol") label = "OH";
    else if (state.group.type === "amine") label = "NH2";
    else if (state.group.type === "amide") label = "CONH2";
    else if (state.group.type === "nitrile") label = "CN";
    else if (state.group.type === "ether") label = "OCH3";

    pathsHTML += `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${stubY}" stroke="#f59e0b" stroke-width="3"/>`;
    pathsHTML += `<rect x="${p.x - 24}" y="${stubY - 10}" width="48" height="20" rx="4" fill="#1e232d" stroke="#f59e0b" stroke-width="1.5"/>`;
    pathsHTML += `<text x="${p.x}" y="${stubY + (up < 0 ? -8 : 16)}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12px" fill="#fbbf24">${label}</text>`;
  }

  // Carbon nodes and IUPAC locants
  points.forEach((p, idx) => {
    const carbonIndex = idx + 1;
    const iupacLocant = result.locantMap[carbonIndex] || carbonIndex;

    pathsHTML += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#3b82f6"/>`;
    pathsHTML += `<circle cx="${p.x}" cy="${p.y + (p.y > baseY ? 18 : -18)}" r="9" fill="#1e232d" stroke="#3b82f6" stroke-width="1"/>`;
    pathsHTML += `<text x="${p.x}" y="${p.y + (p.y > baseY ? 21.5 : -14.5)}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10px" fill="#60a5fa">${iupacLocant}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background:#121418; border-radius:8px; padding:12px;">${pathsHTML}</svg>`;
}

/**
 * Downloads a standalone HTML report file for the current molecule.
 */
export function exportMoleculeAsHTML(state: MoleculeState, result: NamingResult): void {
  const svgContent = generateSkeletalSVG(state, result);

  const locantsTableRows = Array.from({ length: state.chainLength }, (_, i) => {
    const drawnIndex = i + 1;
    const iupacLocant = result.locantMap[drawnIndex] || drawnIndex;
    return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">C${drawnIndex}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: bold; color: #60a5fa;">C${iupacLocant}</td>
      </tr>
    `;
  }).join("");

  const stepsHTML = result.breakdown
    .map(
      (step) => `
    <div style="background: #16191f; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px; margin-bottom: 10px;">
      <div style="font-weight: bold; color: #60a5fa; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
        <span>${step.title}</span>
        ${step.chip ? `<span style="font-size: 11px; background: rgba(59,130,246,0.15); color: #93c5fd; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(59,130,246,0.3);">${step.chip}</span>` : ""}
      </div>
      <p style="margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.5;">${step.detail}</p>
    </div>
  `
    )
    .join("");

  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IUPAC Report - ${result.name}</title>
  <style>
    body {
      background-color: #0f1115;
      color: #f1f5f9;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 30px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .kicker {
      font-size: 12px;
      font-family: monospace;
      color: #60a5fa;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    h1 {
      margin: 4px 0 0 0;
      font-size: 28px;
      color: #ffffff;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
    }
    .btn-print:hover {
      background: #3b82f6;
    }
    .name-card {
      background: #1e2d42;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .iupac-title {
      font-family: monospace;
      font-size: 26px;
      font-weight: 800;
      color: #93c5fd;
      word-break: break-all;
    }
    .badges {
      margin-top: 10px;
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .badge {
      background: rgba(15,17,21,0.8);
      border: 1px solid rgba(59,130,246,0.3);
      padding: 4px 12px;
      border-radius: 20px;
      font-family: monospace;
      font-size: 12px;
      color: #e2e8f0;
    }
    .section-title {
      font-size: 16px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 12px;
      border-bottom: 1px dashed rgba(255,255,255,0.1);
      padding-bottom: 6px;
    }
    .svg-wrapper {
      margin-bottom: 24px;
    }
    .table-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    @media (max-width: 600px) {
      .table-grid { grid-template-columns: 1fr; }
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: monospace;
      font-size: 13px;
      background: #121418;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    th {
      background: #1e232d;
      padding: 8px 12px;
      text-align: left;
      color: #94a3b8;
    }
    footer {
      margin-top: 40px;
      padding-top: 16px;
      border-t: 1px solid rgba(255,255,255,0.1);
      font-size: 11px;
      font-family: monospace;
      color: #64748b;
      text-align: center;
    }
    @media print {
      body { background: #ffffff; color: #000000; }
      .name-card { background: #f0f9ff; border-color: #0284c7; }
      .iupac-title { color: #0369a1; }
      .badge { background: #ffffff; border-color: #cbd5e1; color: #000000; }
      .btn-print { display: none; }
      .section-title { color: #475569; border-color: #cbd5e1; }
      table { border-color: #cbd5e1; }
      th { background: #f1f5f9; color: #334155; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="kicker">Organic Chemistry Nomenclature Notebook</div>
        <h1>Molecule Analysis Report</h1>
      </div>
      <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
    </div>

    <div class="name-card">
      <div class="iupac-title">${result.name}</div>
      <div class="badges">
        <span class="badge">Formula: ${result.formula}</span>
        <span class="badge">MW: ${result.molecularWeight} g/mol</span>
        <span class="badge">Parent: ${state.chainLength} Carbon Chain</span>
      </div>
    </div>

    <div class="section-title">2D Skeletal Molecular Formula</div>
    <div class="svg-wrapper">
      ${svgContent}
    </div>

    <div class="section-title">IUPAC Rule Breakdown</div>
    <div>
      ${stepsHTML}
    </div>

    <div class="section-title" style="margin-top: 24px;">Locant Ruler Mapping</div>
    <div class="table-grid">
      <table>
        <thead>
          <tr>
            <th>Drawn Position</th>
            <th>IUPAC Locant</th>
          </tr>
        </thead>
        <tbody>
          ${locantsTableRows}
        </tbody>
      </table>

      <div style="background: #121418; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; font-size: 12px; font-family: monospace;">
        <div style="color: #60a5fa; font-weight: bold; margin-bottom: 8px;">Structure Summary:</div>
        <ul style="margin: 0; padding-left: 18px; color: #cbd5e1;">
          <li>Chain Length: ${state.chainLength} Carbons</li>
          <li>Principal Group: ${state.group.type !== "none" ? `${state.group.type} at C${state.group.pos}` : "None"}</li>
          <li>Unsaturation: ${state.unsat.type !== "none" ? `${state.unsat.type} starting at C${state.unsat.pos}` : "None (Alkane)"}</li>
          <li>Substituents: ${state.substituents.length > 0 ? state.substituents.map(s => `${s.id} at C${s.pos}`).join(", ") : "None"}</li>
          <li>Direction Flipped: ${result.reverse ? "Yes (Right-to-Left)" : "No (Left-to-Right)"}</li>
        </ul>
      </div>
    </div>

    <footer>
      Generated by Nomenclature Notebook &bull; Organic Chemistry IUPAC Interactive Lab &bull; ${new Date().toLocaleDateString()}
    </footer>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sanitizedName = result.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  link.href = url;
  link.setAttribute("download", `${sanitizedName}_IUPAC_Report.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a master HTML workbook document containing all preset molecules,
 * 2D diagrams, IUPAC formulas, and rule breakdowns in a single comprehensive file.
 */
export function exportAllLibraryAsHTML(): void {
  const cardsHTML = PRESET_MOLECULARS.map((preset) => {
    const result = computeIUPACName(preset.state);
    const svg = generateSkeletalSVG(preset.state, result);

    const steps = result.breakdown
      .map(
        (b: any) => `
        <li style="margin-bottom: 6px;">
          <strong style="color: #60a5fa;">${b.title}:</strong> ${b.detail}
        </li>
      `
      )
      .join("");

    return `
      <div style="background: #16191f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
          <div>
            <h2 style="margin: 0; font-size: 20px; color: #ffffff;">${preset.commonName || preset.name}</h2>
            <div style="font-family: monospace; font-weight: bold; color: #60a5fa; font-size: 14px; margin-top: 2px;">
              IUPAC: ${result.name}
            </div>
          </div>
          <div style="font-family: monospace; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; padding: 4px 12px; border-radius: 6px; font-size: 12px;">
            ${result.formula} &bull; ${result.molecularWeight} g/mol
          </div>
        </div>

        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px; line-height: 1.5;">${preset.description}</p>

        <div style="margin-bottom: 16px;">
          ${svg}
        </div>

        <div style="background: #121418; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px;">
          <div style="font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-size: 11px; margin-bottom: 8px;">
            Nomenclature Derivation Steps:
          </div>
          <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 13px; line-height: 1.6;">
            ${steps}
          </ul>
        </div>
      </div>
    `;
  }).join("");

  const masterDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete IUPAC Organic Chemistry Study Guide</title>
  <style>
    body {
      background-color: #0f1115;
      color: #f1f5f9;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 30px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .kicker {
      font-size: 12px;
      font-family: monospace;
      color: #60a5fa;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    h1 {
      margin: 4px 0 0 0;
      font-size: 30px;
      color: #ffffff;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
    }
    .btn-print:hover { background: #3b82f6; }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 12px;
      font-family: monospace;
      color: #64748b;
      text-align: center;
    }
    @media print {
      body { background: #ffffff; color: #000000; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="kicker">Nomenclature Notebook &bull; Master Reference</div>
        <h1>Complete Organic Chemistry Library</h1>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Full compilation of preset molecules, 2D skeletal formulas, and IUPAC nomenclature step-by-step logic.</p>
      </div>
      <button class="btn-print" onclick="window.print()">Print / Export PDF</button>
    </div>

    ${cardsHTML}

    <footer>
      Master Workbook Generated by Nomenclature Notebook &bull; ${new Date().toLocaleDateString()}
    </footer>
  </div>
</body>
</html>`;

  const blob = new Blob([masterDoc], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Complete_IUPAC_Chemistry_Library.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

