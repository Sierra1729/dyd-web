import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuthToggle } from "@/components/auth/AuthToggle";
import { CandidateForm } from "@/components/auth/CandidateForm";
import { AdminForm } from "@/components/auth/AdminForm";
import { ArrowLeft } from "lucide-react";

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "candidate";
  const [role, setRole] = useState<"candidate" | "admin">(initialRole);

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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose your role to get started
            </p>
          </div>

          <div className="flex justify-center">
            <AuthToggle value={role} onChange={setRole} />
          </div>

          <motion.div
            key={role}
            initial={{ opacity: 0, x: role === "admin" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {role === "candidate" ? <CandidateForm /> : <AdminForm />}
          </motion.div>

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