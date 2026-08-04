import {
  MoleculeState,
  NamingResult,
  SubstituentDef,
  BreakdownStep,
  PresetMolecule
} from "../types";

export const ROOTS = [
  "",
  "meth",
  "eth",
  "prop",
  "but",
  "pent",
  "hex",
  "hept",
  "oct",
  "non",
  "dec",
  "undec",
  "dodec"
];

export const MULTIPLIERS: { [count: number]: string } = {
  2: "di",
  3: "tri",
  4: "tetra",
  5: "penta",
  6: "hexa",
  7: "hepta",
  8: "octa"
};

export const SUBSTITUENTS: SubstituentDef[] = [
  { id: "methyl", name: "methyl", alpha: "methyl", sym: "CH3", category: "alkyl" },
  { id: "ethyl", name: "ethyl", alpha: "ethyl", sym: "C2H5", category: "alkyl" },
  { id: "propyl", name: "propyl", alpha: "propyl", sym: "C3H7", category: "alkyl" },
  { id: "isopropyl", name: "isopropyl", alpha: "isopropyl", sym: "CH(CH3)2", category: "alkyl" },
  { id: "butyl", name: "butyl", alpha: "butyl", sym: "C4H9", category: "alkyl" },
  { id: "tertbutyl", name: "tert-butyl", alpha: "butyl", sym: "C(CH3)3", category: "alkyl" },
  { id: "secbutyl", name: "sec-butyl", alpha: "butyl", sym: "CH(CH3)C2H5", category: "alkyl" },
  { id: "fluoro", name: "fluoro", alpha: "fluoro", sym: "F", category: "halogen" },
  { id: "chloro", name: "chloro", alpha: "chloro", sym: "Cl", category: "halogen" },
  { id: "bromo", name: "bromo", alpha: "bromo", sym: "Br", category: "halogen" },
  { id: "iodo", name: "iodo", alpha: "iodo", sym: "I", category: "halogen" },
  { id: "nitro", name: "nitro", alpha: "nitro", sym: "NO2", category: "nitro" },
  { id: "phenyl", name: "phenyl", alpha: "phenyl", sym: "C6H5", category: "aryl" },
  { id: "cyclopropyl", name: "cyclopropyl", alpha: "cyclopropyl", sym: "C3H5", category: "cycloalkyl" },
  { id: "cyclohexyl", name: "cyclohexyl", alpha: "cyclohexyl", sym: "C6H11", category: "cycloalkyl" },
  { id: "methoxy", name: "methoxy", alpha: "methoxy", sym: "OCH3", category: "oxygen" },
  { id: "ethoxy", name: "ethoxy", alpha: "ethoxy", sym: "OC2H5", category: "oxygen" },
  { id: "hydroxy", name: "hydroxy", prefixName: "hydroxy", alpha: "hydroxy", sym: "OH", category: "oxygen" },
  { id: "amino", name: "amino", prefixName: "amino", alpha: "amino", sym: "NH2", category: "oxygen" }
];

export function getSubstituentById(id: string): SubstituentDef | undefined {
  return SUBSTITUENTS.find((s) => s.id === id);
}

export function mapPos(p: number, n: number, rev: boolean): number {
  return rev ? n + 1 - p : p;
}

interface LocantScore {
  g: number | null;
  u: number | null;
  subs: number[];
}

function pickReverse(a: LocantScore, b: LocantScore): boolean {
  // Rule 1: Principal group locant (lower is better)
  if (a.g !== null || b.g !== null) {
    const av = a.g === null ? Infinity : a.g;
    const bv = b.g === null ? Infinity : b.g;
    if (av !== bv) return bv < av;
  }

  // Rule 2: Unsaturation locant (lower is better)
  if (a.u !== null || b.u !== null) {
    const av = a.u === null ? Infinity : a.u;
    const bv = b.u === null ? Infinity : b.u;
    if (av !== bv) return bv < av;
  }

  // Rule 3: Substituent locants set comparison (first point of difference)
  const len = Math.max(a.subs.length, b.subs.length);
  for (let i = 0; i < len; i++) {
    const av = a.subs[i] === undefined ? Infinity : a.subs[i];
    const bv = b.subs[i] === undefined ? Infinity : b.subs[i];
    if (av !== bv) return bv < av;
  }

  return false;
}

export function computeIUPACName(state: MoleculeState): NamingResult {
  const n = Math.max(1, Math.min(state.chainLength, 12));
  const root = ROOTS[n] || `c${n}`;
  const group = state.group;
  const unsat = state.unsat;
  const subs = state.substituents.filter((s) => s.id);

  // Terminal principal groups MUST be at position C1
  const forceNoFlip =
    group.type === "al" ||
    group.type === "acid" ||
    group.type === "nitrile" ||
    group.type === "amide";

  let reverse = false;

  if (!forceNoFlip) {
    const score = (rev: boolean): LocantScore => ({
      g: group.type !== "none" ? mapPos(group.pos, n, rev) : null,
      u: unsat.type !== "none" ? mapPos(unsat.pos, n, rev) : null,
      subs: subs.map((s) => mapPos(s.pos, n, rev)).sort((x, y) => x - y)
    });
    const a = score(false);
    const b = score(true);
    reverse = pickReverse(a, b);
  }

  const wg = group.type !== "none" ? { ...group, pos: mapPos(group.pos, n, reverse) } : group;
  const wu = unsat.type !== "none" ? { ...unsat, pos: mapPos(unsat.pos, n, reverse) } : unsat;
  const wsubs = subs.map((s) => ({ ...s, pos: mapPos(s.pos, n, reverse) }));

  // Map each carbon atom 1..n as drawn to its final IUPAC locant
  const locantMap: { [drawnIndex: number]: number } = {};
  for (let i = 1; i <= n; i++) {
    locantMap[i] = mapPos(i, n, reverse);
  }

  // Group substituents by id
  const byId: { [id: string]: number[] } = {};
  wsubs.forEach((s) => {
    (byId[s.id] = byId[s.id] || []).push(s.pos);
  });

  const entries = Object.keys(byId).map((id) => {
    const def = getSubstituentById(id) || {
      id,
      name: id,
      alpha: id,
      sym: id,
      category: "alkyl"
    };
    const positions = byId[id].sort((x, y) => x - y);
    const count = positions.length;
    const mult = count > 1 ? MULTIPLIERS[count] || "" : "";
    return {
      alpha: def.alpha,
      text: `${positions.join(",")}-${mult}${def.name}`
    };
  });

  entries.sort((a, b) => a.alpha.localeCompare(b.alpha));
  const subPart = entries.map((e) => e.text).join("-");

  // Infix / Unsaturation
  let mid = "an";
  if (wu.type === "ene") mid = "en";
  if (wu.type === "yne") mid = "yn";
  if (wu.type === "diene") mid = "adien";

  const showULocant = wu.type !== "none" && n >= 4;
  let unsatPart = "an";
  if (wu.type !== "none") {
    if (wu.type === "diene") {
      unsatPart = `-${wu.pos},${wu.pos + 2}-dien`;
    } else {
      unsatPart = showULocant ? `-${wu.pos}-${mid}` : mid;
    }
  }

  // Suffix / Functional Group
  let groupPart = "e";
  let showGLocant = false;

  switch (wg.type) {
    case "none":
      groupPart = "e";
      break;
    case "ol":
      showGLocant = n >= 3;
      groupPart = showGLocant ? `-${wg.pos}-ol` : "ol";
      break;
    case "al":
      groupPart = "al";
      break;
    case "one":
      showGLocant = true;
      groupPart = `-${wg.pos}-one`;
      break;
    case "acid":
      groupPart = "oic acid";
      break;
    case "amide":
      groupPart = "amide";
      break;
    case "nitrile":
      groupPart = "nitrile";
      break;
    case "amine":
      showGLocant = n >= 3;
      groupPart = showGLocant ? `-${wg.pos}-amine` : "amine";
      break;
    case "ether":
      showGLocant = n >= 3;
      groupPart = showGLocant ? `-${wg.pos}-oxy` : "oxy";
      break;
    default:
      groupPart = "e";
  }

  // Handle IUPAC vowel e-dropping rule (e.g. hexan-1-ol instead of hexane-1-ol)
  let word = root + unsatPart + groupPart;
  if (subPart) {
    word = `${subPart}-${word}`;
  }

  // Clean double hyphens if any
  const finalName = word.replace(/--+/g, "-");

  // Generate breakdown steps
  const breakdown: BreakdownStep[] = [
    {
      title: "Parent Chain Identification",
      detail: `The continuous carbon chain contains ${n} carbon atoms, corresponding to root prefix '${root}-'.`,
      chip: `${root}-`,
      type: "root"
    },
    {
      title: "Locant Numbering Direction",
      detail: forceNoFlip
        ? `Numbering is fixed starting at the principal terminal carbon (C1) for ${
            wg.type === "acid" ? "carboxylic acid" : "aldehyde"
          }.`
        : reverse
        ? `Numbering was flipped (right-to-left as drawn) to give lower locants to the highest priority functional feature.`
        : `Numbered left-to-right as drawn as it provides the lowest locant set.`,
      chip: reverse ? "Right-to-Left (Flipped)" : "Left-to-Right",
      type: "numbering"
    }
  ];

  if (wg.type !== "none") {
    const labels: { [k: string]: string } = {
      ol: "Alcohol (-ol)",
      al: "Aldehyde (-al)",
      one: "Ketone (-one)",
      acid: "Carboxylic Acid (-oic acid)",
      amine: "Amine (-amine)",
      amide: "Amine (-amide)",
      nitrile: "Nitrile (-nitrile)",
      ether: "Ether (-oxy)"
    };
    breakdown.push({
      title: "Principal Functional Group",
      detail: `${labels[wg.type] || wg.type} at position C${wg.pos} defines the principal suffix.`,
      chip: suffixLabel(wg.type),
      type: "group"
    });
  }

  if (wu.type !== "none") {
    breakdown.push({
      title: "Chain Unsaturation",
      detail: `${
        wu.type === "ene" ? "Double bond" : wu.type === "yne" ? "Triple bond" : "Diene"
      } starting at C${wu.pos} defines the infix '-${mid}-'.`,
      chip: `-${wu.pos}-${mid}-`,
      type: "unsat"
    });
  }

  if (entries.length > 0) {
    breakdown.push({
      title: "Substituent Prefixes (Alphabetical)",
      detail: `Substituents arranged alphabetically (excluding multiplier prefixes like di-/tri-): ${entries
        .map((e) => e.text)
        .join(", ")}.`,
      chip: entries.map((e) => e.text).join(" | "),
      type: "substituents"
    });
  } else {
    breakdown.push({
      title: "Substituents",
      detail: "No alkyl, halo, or nitro substituents attached to the parent chain.",
      type: "substituents"
    });
  }

  // Calculate Formula & Molecular Weight
  const { formula, molecularWeight } = calculateFormulaAndMW(n, wg, wu, wsubs);

  return {
    name: finalName,
    formula,
    molecularWeight,
    reverse,
    forceNoFlip,
    breakdown,
    locantMap
  };
}

function suffixLabel(type: string): string {
  switch (type) {
    case "ol": return "-ol";
    case "al": return "-al";
    case "one": return "-one";
    case "acid": return "-oic acid";
    case "amine": return "-amine";
    case "amide": return "-amide";
    case "nitrile": return "-nitrile";
    default: return "-e";
  }
}

function calculateFormulaAndMW(
  n: number,
  group: { type: string; pos: number },
  unsat: { type: string; pos: number },
  subs: { id: string; pos: number }[]
) {
  let c = n;
  let h = 2 * n + 2; // alkane baseline
  let o = 0;
  let nAtoms = 0;
  let f = 0, cl = 0, br = 0, iAtoms = 0;

  // Unsaturation adjustment
  if (unsat.type === "ene") h -= 2;
  else if (unsat.type === "yne") h -= 4;
  else if (unsat.type === "diene") h -= 4;

  // Group adjustments
  if (group.type === "ol") { o += 1; }
  else if (group.type === "al") { o += 1; h -= 2; }
  else if (group.type === "one") { o += 1; h -= 2; }
  else if (group.type === "acid") { o += 2; h -= 2; }
  else if (group.type === "amine") { nAtoms += 1; h += 1; }

  // Substituents
  subs.forEach((s) => {
    switch (s.id) {
      case "methyl": c += 1; h += 2; break;
      case "ethyl": c += 2; h += 4; break;
      case "propyl": c += 3; h += 6; break;
      case "isopropyl": c += 3; h += 6; break;
      case "butyl": c += 4; h += 8; break;
      case "tertbutyl": c += 4; h += 8; break;
      case "secbutyl": c += 4; h += 8; break;
      case "fluoro": f += 1; h -= 1; break;
      case "chloro": cl += 1; h -= 1; break;
      case "bromo": br += 1; h -= 1; break;
      case "iodo": iAtoms += 1; h -= 1; break;
      case "nitro": nAtoms += 1; o += 2; h -= 1; break;
      case "phenyl": c += 6; h += 4; break;
      case "cyclopropyl": c += 3; h += 4; break;
      case "cyclohexyl": c += 6; h += 10; break;
      case "hydroxy": o += 1; break;
      case "amino": nAtoms += 1; h += 1; break;
      case "methoxy": c += 1; o += 1; h += 2; break;
      case "ethoxy": c += 2; o += 1; h += 4; break;
    }
  });

  // Construct Hill System Formula (C, H, then alphabetical: Br, Cl, F, I, N, O)
  let formulaStr = `C${c > 1 ? c : ""}`;
  if (h > 0) formulaStr += `H${h > 1 ? h : ""}`;
  if (br > 0) formulaStr += `Br${br > 1 ? br : ""}`;
  if (cl > 0) formulaStr += `Cl${cl > 1 ? cl : ""}`;
  if (f > 0) formulaStr += `F${f > 1 ? f : ""}`;
  if (iAtoms > 0) formulaStr += `I${iAtoms > 1 ? iAtoms : ""}`;
  if (nAtoms > 0) formulaStr += `N${nAtoms > 1 ? nAtoms : ""}`;
  if (o > 0) formulaStr += `O${o > 1 ? o : ""}`;

  const mw =
    c * 12.011 +
    h * 1.008 +
    o * 15.999 +
    nAtoms * 14.007 +
    f * 18.998 +
    cl * 35.45 +
    br * 79.904 +
    iAtoms * 126.90;

  return { formula: formulaStr, molecularWeight: Math.round(mw * 100) / 100 };
}

export const PRESET_MOLECULARS: PresetMolecule[] = [
  {
    id: "ethanol",
    name: "ethanol",
    commonName: "Ethyl Alcohol",
    description: "Primary alcohol used in beverages, biofuels, and hand sanitizers.",
    tags: ["Alcohol", "Introductory"],
    state: {
      chainLength: 2,
      group: { type: "ol", pos: 1 },
      unsat: { type: "none", pos: 1 },
      substituents: []
    }
  },
  {
    id: "acetone",
    name: "propan-2-one",
    commonName: "Acetone",
    description: "Simplest ketone, widespread organic solvent in laboratories and cosmetics.",
    tags: ["Ketone", "Common Solvent"],
    state: {
      chainLength: 3,
      group: { type: "one", pos: 2 },
      unsat: { type: "none", pos: 1 },
      substituents: []
    }
  },
  {
    id: "acetic_acid",
    name: "ethanoic acid",
    commonName: "Acetic Acid (Vinegar)",
    description: "Carboxylic acid responsible for the sour taste and pungent smell of vinegar.",
    tags: ["Carboxylic Acid", "Household"],
    state: {
      chainLength: 2,
      group: { type: "acid", pos: 1 },
      unsat: { type: "none", pos: 1 },
      substituents: []
    }
  },
  {
    id: "isopropanol",
    name: "propan-2-ol",
    commonName: "Isopropanol / Rubbing Alcohol",
    description: "Secondary alcohol used widely as an antiseptic and solvent.",
    tags: ["Alcohol", "Medical"],
    state: {
      chainLength: 3,
      group: { type: "ol", pos: 2 },
      unsat: { type: "none", pos: 1 },
      substituents: []
    }
  },
  {
    id: "chlorobutane",
    name: "2-chlorobutane",
    commonName: "sec-Butyl Chloride",
    description: "Haloalkane example showcasing substituent locant priority.",
    tags: ["Haloalkane", "Substituents"],
    state: {
      chainLength: 4,
      group: { type: "none", pos: 1 },
      unsat: { type: "none", pos: 1 },
      substituents: [{ id: "chloro", pos: 2 }]
    }
  },
  {
    id: "lactic_acid_precursor",
    name: "2-hydroxypropanoic acid",
    commonName: "Lactic Acid",
    description: "Bifunctional organic compound produced during cellular respiration.",
    tags: ["Carboxylic Acid", "Biochemistry"],
    state: {
      chainLength: 3,
      group: { type: "acid", pos: 1 },
      unsat: { type: "none", pos: 1 },
      substituents: [{ id: "hydroxy", pos: 2 }]
    }
  },
  {
    id: "isooctane",
    name: "2,2,4-trimethylpentane",
    commonName: "Isooctane",
    description: "Standard reference molecule for octane rating in gasoline.",
    tags: ["Branched Alkane", "Fuel Standard"],
    state: {
      chainLength: 5,
      group: { type: "none", pos: 1 },
      unsat: { type: "none", pos: 1 },
      substituents: [
        { id: "methyl", pos: 2 },
        { id: "methyl", pos: 2 },
        { id: "methyl", pos: 4 }
      ]
    }
  },
  {
    id: "propenal",
    name: "prop-2-enal",
    commonName: "Acrolein",
    description: "Unsaturated aldehyde with both double bond and aldehyde functionality.",
    tags: ["Aldehyde", "Unsaturated"],
    state: {
      chainLength: 3,
      group: { type: "al", pos: 1 },
      unsat: { type: "ene", pos: 2 },
      substituents: []
    }
  }
];
