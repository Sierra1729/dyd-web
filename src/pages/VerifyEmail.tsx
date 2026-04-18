import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { sendEmailVerification, onAuthStateChanged, User } from "firebase/auth";

import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { CandidateProfileForm } from "@/components/auth/CandidateProfileForm";
import { AdminProfileForm } from "@/components/auth/AdminProfileForm";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsVerified(currentUser.emailVerified);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const checkVerification = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast.error("Session expired. Please sign in or register.");
        navigate("/login");
        return;
      }

      await user.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser?.emailVerified) {
        setIsVerified(true);
        toast.success("Email verified! Now, let's complete your profile.");
      } else {
        toast.error("Email not verified yet. Please check your inbox 📩");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to check verification status");
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    try {
      if (!user) return;
      await sendEmailVerification(user);
      toast.success("Verification email sent again 📩");
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please wait a few minutes.");
      } else {
        toast.error("Failed to resend email");
      }
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const isAdmin = user.email?.endsWith("@jammuuniversity.ac.in");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <CosmicBackground />
      
      {/* Centered Glowing Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-lg h-[80%] max-h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </motion.div>

        <GlassCard className="space-y-6">
          <AnimatePresence mode="wait">
            {!isVerified ? (
              <motion.div
                key="verify-gate"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
                  <Mail className="w-10 h-10 text-primary-foreground" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Check your inbox
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    We've sent a verification link to <span className="font-medium text-foreground">{user.email}</span>. 
                    Please click it to keep going.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={checkVerification}
                    disabled={loading}
                    className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 h-11 hover:shadow-antigravity-hover transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Refresh Status
                  </Button>
                  
                  <button
                    onClick={resendEmail}
                    className="text-sm text-primary font-medium hover:underline underline-offset-4"
                  >
                    Resend email
                  </button>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Use a different email
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <CheckCircle2 className="w-3 h-3" /> Email Verified
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Complete your profile
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Just a few more details to set up your {isAdmin ? "admin" : "candidate"} account
                  </p>
                </div>

                {isAdmin ? <AdminProfileForm /> : <CandidateProfileForm />}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};

export default VerifyEmail;