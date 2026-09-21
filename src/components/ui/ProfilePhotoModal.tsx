import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoURL?: string | null;
  name?: string;
  subtitle?: string;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  photoURL,
  name = "Profile Photo",
  subtitle,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && photoURL && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop with blur - Instagram style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 15 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="relative z-10 flex flex-col items-center max-w-lg w-full pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Name and Close button */}
            <div className="w-full flex items-center justify-between mb-4 px-3">
              <div className="text-left">
                <h3 className="text-lg font-bold text-white tracking-wide truncate max-w-[240px] sm:max-w-xs">
                  {name}
                </h3>
                {subtitle && (
                  <p className="text-xs text-white/60 font-medium uppercase tracking-wider">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={photoURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-sm"
                  title="Open high-res original"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-sm focus:outline-none"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Instagram-style circular DP container with iconic gradient ring */}
            <div className="relative group p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-2xl shadow-rose-950/50">
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden bg-black border-4 border-black flex items-center justify-center relative shadow-inner">
                <img
                  src={photoURL}
                  alt={name}
                  className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-105"
                  draggable={false}
                />
              </div>
            </div>

            {/* Bottom Hint */}
            <p className="text-[11px] text-white/40 mt-5 font-medium tracking-widest uppercase">
              Click anywhere outside or press Esc to close
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
