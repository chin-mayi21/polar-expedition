import { create } from "zustand";

type FieldConnectivityState = {
  forceOffline: boolean;
  pendingCount: number;
  setForceOffline: (value: boolean) => void;
  setPendingCount: (n: number) => void;
  isEffectivelyOnline: () => boolean;
};

export const useFieldConnectivity = create<FieldConnectivityState>((set, get) => ({
  forceOffline: false,
  pendingCount: 0,
  setForceOffline: (value) => set({ forceOffline: value }),
  setPendingCount: (n) => set({ pendingCount: n }),
  isEffectivelyOnline: () => {
    if (get().forceOffline) return false;
    if (typeof navigator !== "undefined") return navigator.onLine;
    return true;
  },
}));
