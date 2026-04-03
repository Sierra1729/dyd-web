import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  levitate?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ levitate = false, children, className, ...props }: GlassCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={cn(
      "glass rounded-3xl p-8 shadow-antigravity transition-all duration-300 hover:shadow-antigravity-hover hover:-translate-y-1",
      levitate && "animate-levitate",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);
