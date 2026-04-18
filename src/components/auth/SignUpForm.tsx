import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "./PasswordStrength";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { candidateAuthSchema, adminAuthSchema, type CandidateAuthData, type AdminAuthData } from "@/lib/validators";

interface SignUpFormProps {
  role: "candidate" | "admin";
}

export const SignUpForm = ({ role }: SignUpFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = role === "admin" ? adminAuthSchema : candidateAuthSchema;
  
  // Use generic Record<string, any> for hook form because the schema changes dynamically
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (role === "admin" && !data.email.endsWith("@jammuuniversity.ac.in")) {
        toast.error("Only @jammuuniversity.ac.in emails are allowed");
        return;
      }

      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Step 2: Send verification email
      await sendEmailVerification(user);

      toast.success("Verification email sent! Check your inbox 📩");

      // Go to verify page
      navigate("/verify-email");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${role}-email`} className="text-sm text-foreground">
          {role === "admin" ? "Institutional Email" : "Email Address"}
        </Label>
        <Input
          id={`${role}-email`}
          type="email"
          placeholder={role === "admin" ? "you@jammuuniversity.ac.in" : "you@example.com"}
          {...register("email")}
          className="rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 focus-visible:ring-primary/30 backdrop-blur-md transition-all placeholder:text-muted-foreground/50 h-11"
        />
        {role === "admin" && (
          <p className="text-xs text-muted-foreground">
            Only @jammuuniversity.ac.in emails accepted
          </p>
        )}
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message as string}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${role}-password`} className="text-sm text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id={`${role}-password`}
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            {...register("password")}
            className="rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 pr-10 focus-visible:ring-primary/30 backdrop-blur-md transition-all placeholder:text-muted-foreground/50 h-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrength password={password || ""} />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message as string}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${role}-confirmPassword`} className="text-sm text-foreground">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id={`${role}-confirmPassword`}
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            {...register("confirmPassword")}
            className="rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 pr-10 focus-visible:ring-primary/30 backdrop-blur-md transition-all placeholder:text-muted-foreground/50 h-11"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message as string}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 h-11 hover:shadow-antigravity-hover transition-all hover:brightness-110 active:scale-[0.98]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {loading ? "Creating account..." : "Continue to Verify"}
      </Button>
    </form>
  );
};
