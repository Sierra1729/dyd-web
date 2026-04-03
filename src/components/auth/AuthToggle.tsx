import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthToggleProps {
  value: "candidate" | "admin";
  onChange: (value: "candidate" | "admin") => void;
  className?: string;
}

export const AuthToggle = ({ value, onChange, className }: AuthToggleProps) => (
  <div className={cn("relative flex rounded-full p-1 bg-secondary/80 backdrop-blur-sm w-full max-w-xs", className)}>
    <motion.div
      className="absolute inset-y-1 rounded-full shadow-antigravity bg-card"
      style={{ width: "calc(50% - 4px)" }}
      animate={{ left: value === "admin" ? "calc(50% + 2px)" : "4px" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
    <button
      onClick={() => onChange("candidate")}
      className={cn(
        "z-10 flex-1 py-2.5 text-sm font-medium rounded-full transition-colors",
        value === "candidate" ? "text-foreground" : "text-muted-foreground"
      )}
    >
      Candidate
    </button>
    <button
      onClick={() => onChange("admin")}
      className={cn(
        "z-10 flex-1 py-2.5 text-sm font-medium rounded-full transition-colors",
        value === "admin" ? "text-foreground" : "text-muted-foreground"
      )}
    >
      Administrator
    </button>
  </div>
);
