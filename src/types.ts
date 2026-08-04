export type FunctionalGroupType =
  | "none"
  | "acid"       // Carboxylic acid (-oic acid)
  | "ester"      // Ester (-oate)
  | "amide"      // Amide (-amide)
  | "nitrile"    // Nitrile (-nitrile)
  | "al"         // Aldehyde (-al)
  | "one"        // Ketone (-one)
  | "ol"         // Alcohol (-ol)
  | "amine"      // Amine (-amine)
  | "ether";     // Ether (-oxy)

export type UnsaturationType =
  | "none"
  | "ene"        // Double bond
  | "yne"        // Triple bond
  | "diene";      // Two double bonds

export interface FunctionalGroupConfig {
  type: FunctionalGroupType;
  pos: number;
}

export interface UnsaturationConfig {
  type: UnsaturationType;
  pos: number; // For diene, primary pos
}

export interface SubstituentConfig {
  id: string;
  pos: number;
}

export interface MoleculeState {
  chainLength: number;
  group: FunctionalGroupConfig;
  unsat: UnsaturationConfig;
  substituents: SubstituentConfig[];
}

export interface SubstituentDef {
  id: string;
  name: string;        // Prefix in IUPAC name e.g. "methyl"
  prefixName?: string; // Alternative when used as secondary group e.g. "hydroxy"
  alpha: string;       // Alphabetization key
  sym: string;         // Formula symbol in diagram e.g. "CH3" or "Cl"
  category: "alkyl" | "halogen" | "nitro" | "aryl" | "cycloalkyl" | "oxygen";
}

export interface BreakdownStep {
  title: string;
  detail: string;
  chip?: string;
  type?: "root" | "numbering" | "group" | "unsat" | "substituents" | "formatting";
}

export interface NamingResult {
  name: string;
  formula: string;
  molecularWeight: number;
  reverse: boolean;
  forceNoFlip: boolean;
  breakdown: BreakdownStep[];
  locantMap: { [carbonIndex: number]: number }; // Maps 1-based drawn index to 1-based IUPAC locant
}

export interface QuizQuestion {
  id: string;
  molecule: MoleculeState;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}

export interface PresetMolecule {
  id: string;
  name: string;
  commonName?: string;
  description: string;
  state: MoleculeState;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
