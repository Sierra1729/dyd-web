import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { apiService } from "@/services/api";

import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ Called when user clicks "I have verified my email"
  const checkVerification = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error("Session expired. Please register again.");
        navigate("/register");
        return;
      }

      // 🔁 Reload user to get latest emailVerified status from Firebase
      await user.reload();

      if (!user.emailVerified) {
        toast.error("Email not verified yet. Please click the link in your inbox ❌");
        return;
      }

      // ✅ Force-refresh token so backend sees email_verified: true
      const token = await user.getIdToken(true);

      // 💾 Get stored form data saved during registration
      const storedData = JSON.parse(localStorage.getItem("userData") || "{}");

      if (!storedData || Object.keys(storedData).length === 0) {
        // No stored data — user might have already completed this step
        toast.success("Already verified! Redirecting...");
        navigate("/login");
        return;
      }

      // 🔥 Send to backend — save user profile now that email is verified
      const result = await apiService.saveUser(storedData, token);

      // 🧹 Cleanup localStorage
      localStorage.removeItem("userData");

      toast.success("Email verified & account created 🎉");

      // ✅ Role-based redirect
      navigate(result.data.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Resend verification email
  const resendEmail = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error("Session expired. Please register again.");
        navigate("/register");
        return;
      }

      await sendEmailVerification(user);
      toast.success("Verification email sent again 📩");
    } catch (error: any) {
      console.error(error);
      // Firebase throws if emails are sent too frequently
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please wait a few minutes and try again.");
      } else {
        toast.error("Failed to resend email");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <CosmicBackground />

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </motion.div>

        <GlassCard className="text-center space-y-6">
          {/* ICON */}
          <motion.div
            className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Mail className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          {/* TEXT */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              Click the verification link sent to your email, then come back and
              press the button below.
            </p>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={checkVerification}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-white flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {loading ? "Checking..." : "I have verified my email ✅"}
          </button>

          {/* RESEND */}
          <p className="text-sm text-muted-foreground">
            Didn't receive email?{" "}
            <button
              onClick={resendEmail}
              className="text-primary font-medium hover:underline"
            >
              Resend
            </button>
          </p>

          <Link
            to="/login"
            className="inline-flex text-sm text-primary font-medium hover:underline"
          >
            Back to login
          </Link>
        </GlassCard>
      </div>
    </div>
  );
};

export default VerifyEmail;