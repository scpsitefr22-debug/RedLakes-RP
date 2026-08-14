import { AnimatePresence, motion } from "framer-motion";

export interface ToastItem {
  id: number;
  message: string;
}

interface ToastStackProps {
  toasts: ToastItem[];
}

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="pointer-events-none absolute bottom-14 right-4 z-40 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="border border-panel-border bg-panel/95 px-3 py-2 text-[10px] text-foreground shadow-lg backdrop-blur-sm"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
