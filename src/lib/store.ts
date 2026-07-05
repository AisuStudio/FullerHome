import { create } from "zustand";
import { ShellDesign, BuildStep, HouseType } from "./shell/types";
import {
  generateShell,
  configForBudget,
  computeCosts,
  CostBreakdown,
} from "./shell/generate";
import { sequenceBuild } from "./shell/sequence";

export type SimPhase = "planning" | "delivery" | "building" | "done";

const DEFAULT_BUDGET = 320_000;

interface SimState {
  phase: SimPhase;
  budget: number;
  houseType: HouseType;
  design: ShellDesign;
  steps: BuildStep[];
  costs: CostBreakdown;
  /** number of completed steps (plates actually placed) */
  cursor: number;
  speed: number;
  paused: boolean;
  /** true once the robot has ridden the rail out — door element installs after */
  exitDone: boolean;

  setBudget: (budget: number) => void;
  setHouseType: (t: HouseType) => void;
  setExitDone: () => void;
  startDelivery: () => void;
  startBuild: () => void;
  placeNext: () => void;
  setCursor: (n: number) => void;
  setSpeed: (s: number) => void;
  togglePause: () => void;
  reset: () => void;
}

function build(budget: number, houseType: HouseType) {
  const design = generateShell(configForBudget(budget, houseType));
  const steps = sequenceBuild(design);
  const costs = computeCosts(design);
  return { design, steps, costs };
}

const initial = build(DEFAULT_BUDGET, "iglu");

export const useSimStore = create<SimState>((set, get) => ({
  phase: "planning",
  budget: DEFAULT_BUDGET,
  houseType: "iglu",
  ...initial,
  cursor: 0,
  speed: 3,
  paused: false,
  exitDone: false,

  setBudget: (budget) => {
    if (get().phase !== "planning") return;
    set({ budget, ...build(budget, get().houseType), cursor: 0, exitDone: false });
  },

  setHouseType: (houseType) => {
    if (get().phase !== "planning") return;
    set({ houseType, ...build(get().budget, houseType), cursor: 0, exitDone: false });
  },

  setExitDone: () => set({ exitDone: true }),

  startDelivery: () => set({ phase: "delivery" }),
  startBuild: () => set({ phase: "building", paused: false }),

  placeNext: () => {
    const { cursor, steps } = get();
    const next = cursor + 1;
    set({
      cursor: next,
      phase: next >= steps.length ? "done" : "building",
    });
  },

  setCursor: (n) => set({ cursor: Math.max(0, Math.min(n, get().steps.length)) }),
  setSpeed: (s) => set({ speed: s }),
  togglePause: () => set((st) => ({ paused: !st.paused })),

  reset: () => set({ phase: "planning", cursor: 0, paused: false, exitDone: false }),
}));
