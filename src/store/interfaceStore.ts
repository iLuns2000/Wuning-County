import { create } from "zustand";
import { useGameStore } from "@/store/gameStore";

export type InterfaceVersion = "classic" | "modern";
const STORAGE_KEY = "wuning-interface-version";

function readPreference(): InterfaceVersion | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "classic" || value === "modern" ? value : null;
  } catch {
    return null;
  }
}

const savedPreference = readPreference();
const hasSave = Boolean(useGameStore.getState().role);

export const useInterfaceStore = create<{
  version: InterfaceVersion;
  needsChoice: boolean;
  needsBackgroundChoice: boolean;
  dismissBackgroundChoice: () => void;
  selectVersion: (version: InterfaceVersion) => void;
}>((set, get) => ({
  version: savedPreference ?? (hasSave ? "classic" : "modern"),
  needsChoice: savedPreference === null && hasSave,
  needsBackgroundChoice: false,
  dismissBackgroundChoice: () => set({ needsBackgroundChoice: false }),
  selectVersion: (version) => {
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch {
      // Keep the selection usable when browser storage is unavailable.
    }
    const needsBackgroundChoice =
      version === "modern" && (get().version !== "modern" || get().needsChoice);
    set({ version, needsChoice: false, needsBackgroundChoice });
  },
}));
