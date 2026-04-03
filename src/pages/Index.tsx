import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const Index = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <CosmicBackground />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl flex flex-col items-center text-center space-y-12"
      >
        {/* Hero */}
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium glass shadow-antigravity text-muted-foreground mb-4">
            <span className="w-2 h-2 rounded-full gradient-primary animate-pulse-glow" />
            University of Jammu
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Elevate your{" "}
            <span className="text-gradient">academic journey</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A seamless, secure gateway for the University of Jammu community.
            Register and access your academic portal in moments.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link to="/register?role=candidate" className="group">
            <GlassCard className="h-full flex flex-col items-center text-center gap-4 cursor-pointer group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Join as Student</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Register for examinations, view results and access academic resources
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </span>
            </GlassCard>
          </Link>

          <Link to="/register?role=admin" className="group">
            <GlassCard className="h-full flex flex-col items-center text-center gap-4 cursor-pointer group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                <ShieldCheck className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Admin Portal</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage departments, verify candidates and oversee institutional operations
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                Access portal <ArrowRight className="w-4 h-4" />
              </span>
            </GlassCard>
          </Link>
        </motion.div>

        {/* Login link */}
        <motion.div variants={fadeUp}>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
