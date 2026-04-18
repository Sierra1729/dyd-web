import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  forgotPasswordSchema,
  type LoginData,
  type ForgotPasswordData,
} from "@/lib/validators";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuthToggle } from "@/components/auth/AuthToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"candidate" | "admin">("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const forgotForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onLogin = async (data: LoginData) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // 🔒 Block unverified users
      if (!user.emailVerified) {
        await auth.signOut();
        toast.error("Please verify your email before logging in.");
        return;
      }

      // ✅ Force-refresh token so backend sees emailVerified: true
      const token = await user.getIdToken(true);

      // ✅ Check if user profile already exists in backend
      let userData;
      try {
        userData = await apiService.getUser(token);
      } catch (err: any) {
        if (err.message === "User not found") {
          // Profile not saved yet — could happen if they skipped VerifyEmail page
          toast.error("Profile not found. Please complete verification.");
          navigate("/verify-email");
          return;
        }
        throw err;
      }

      // 🔐 Check Admin Approval Status (Step 4)
      if (userData.isApproved === false) {
        await auth.signOut();
        toast.error("Your profile is not yet approved by admin. You will be notified once approved.");
        return;
      }

      toast.success("Login successful 🚀");

      // ✅ Role-based redirect
      navigate(userData.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      
      if (error.code?.startsWith("auth/")) {
        // Firebase Auth Specific Errors
        const msg = error.code === "auth/invalid-credential" 
          ? "Invalid email or password" 
          : error.message;
        toast.error(msg);
      } else if (error.message?.includes("Failed to fetch") || error.code === "ECONNREFUSED") {
        // Backend connection error
        toast.error("Cloud connection failed. Please ensure the backend is running.");
      } else {
        toast.error(error.message || "An unexpected error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async (data: ForgotPasswordData) => {
    setLoading(true);
    try {
      // ✅ Real Firebase password reset email
      await sendPasswordResetEmail(auth, data.email);
      setForgotSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <CosmicBackground />
      
      {/* Centered Glowing Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-lg h-[80%] max-h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
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
          <AnimatePresence mode="wait">
            {forgotMode ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Reset password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a reset link
                  </p>
                </div>

                {forgotSent ? (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
                      <Mail className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Check your inbox for the reset link.
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setForgotMode(false);
                        setForgotSent(false);
                      }}
                      className="text-primary"
                    >
                      Back to login
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={forgotForm.handleSubmit(onForgot)}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-sm text-foreground">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...forgotForm.register("email")}
                        className="rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 focus-visible:ring-primary/30 backdrop-blur-md transition-all placeholder:text-muted-foreground/50 h-11"
                      />
                      {forgotForm.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {forgotForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 h-11 hover:shadow-antigravity-hover transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setForgotMode(false)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back to login
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                    Welcome back <span className="w-2 h-2 rounded-full gradient-primary animate-pulse-glow" />
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Sign in to your <span className="text-gradient font-medium">academic portal</span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <AuthToggle value={role} onChange={setRole} />
                </div>

                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder={
                        role === "admin"
                          ? "you@jammuuniversity.ac.in"
                          : "you@example.com"
                      }
                      {...loginForm.register("email")}
                      className="rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 focus-visible:ring-primary/30 backdrop-blur-md transition-all placeholder:text-muted-foreground/50 h-11"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-foreground">Password</Label>
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-xs text-primary hover:underline underline-offset-4"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...loginForm.register("password")}
                        className="rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 pr-10 focus-visible:ring-primary/30 backdrop-blur-md transition-all placeholder:text-muted-foreground/50 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 h-11 hover:shadow-antigravity-hover transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary font-medium hover:underline underline-offset-4"
                  >
                    Register
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;