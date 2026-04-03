import { motion } from "framer-motion";

export const CosmicBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-background" />
    {/* Cosmic circles */}
    <motion.div
      className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
      style={{ background: "radial-gradient(circle, hsl(243 75% 59% / 0.3), transparent 70%)" }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: "radial-gradient(circle, hsl(199 89% 48% / 0.25), transparent 70%)" }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    <motion.div
      className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full opacity-10"
      style={{ background: "radial-gradient(circle, hsl(243 75% 59% / 0.2), transparent 70%)" }}
      animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Floating dots */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary/20"
        style={{
          top: `${15 + i * 15}%`,
          left: `${10 + i * 16}%`,
        }}
        animate={{ y: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
      />
    ))}
  </div>
);
