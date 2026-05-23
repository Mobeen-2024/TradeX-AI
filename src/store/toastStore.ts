import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Toast {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: Toast["type"], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message, duration = 4000) => {
    const id = uuidv4();
    set((s) => ({ toasts: [...s.toasts, { id, type, message, duration }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
