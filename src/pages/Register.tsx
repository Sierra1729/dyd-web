import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ArrowLeft } from "lucide-react";

const Register = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <CosmicBackground />
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </motion.div>

        <GlassCard className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Candidate Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to register as a student for Design Your Degree
            </p>
          </div>

          <SignUpForm role="candidate" />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Register;