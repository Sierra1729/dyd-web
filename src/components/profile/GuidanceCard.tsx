import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface GuidanceCardProps {
  title: string;
  description: string;
  action?: () => void;
  actionText?: string;
  onClose?: () => void;
}

export const GuidanceCard = ({ 
  title, 
  description, 
  action, 
  actionText, 
  onClose 
}: GuidanceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] w-full max-w-[320px]"
    >
      <GlassCard className="p-5 border-primary/30 bg-primary/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -mr-8 -mt-8 group-hover:bg-primary/20 transition-all duration-500" />
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">{title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {action && (
              <button 
                onClick={action}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2 transition-all"
              >
                {actionText || "Get Started"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
