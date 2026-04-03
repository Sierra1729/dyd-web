import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminSchema, type AdminData } from "@/lib/validators";
import { PasswordStrength } from "./PasswordStrength";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const departments = [
  { value: "CS", label: "Computer Science" },
  { value: "Math", label: "Mathematics" },
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "English", label: "English" },
  { value: "Economics", label: "Economics" },
] as const;

export const AdminForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminData>({
    resolver: zodResolver(adminSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: AdminData) => {
    setLoading(true);
    try {
      // 🔒 Frontend validation — only university emails
      if (!data.email.endsWith("@jammuuniversity.ac.in")) {
        toast.error("Only @jammuuniversity.ac.in emails are allowed");
        return;
      }

      // 🔐 Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // 📧 Step 2: Send verification email
      await sendEmailVerification(user);

      // 💾 Step 3: Store form data in localStorage so VerifyEmail page can send it to backend
      localStorage.setItem(
        "userData",
        JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          department: data.department,
        })
      );

      toast.success("Verification email sent! Check your inbox 📩");

      // 👉 Step 4: Go to verify page — do NOT signOut, currentUser needed for user.reload()
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
        <Label htmlFor="admin-fullName" className="text-sm text-foreground">
          Full Name
        </Label>
        <Input
          id="admin-fullName"
          placeholder="Enter your full name"
          {...register("fullName")}
          className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admin-email" className="text-sm text-foreground">
          Institutional Email
        </Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="you@jammuuniversity.ac.in"
          {...register("email")}
          className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground">
          Only @jammuuniversity.ac.in emails accepted
        </p>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admin-phone" className="text-sm text-foreground">
          Phone Number
        </Label>
        <Input
          id="admin-phone"
          placeholder="+91 9876543210"
          {...register("phone")}
          className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-foreground">Department</Label>
        <Select
          onValueChange={(val) =>
            setValue("department", val as AdminData["department"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="rounded-xl bg-secondary/50 border-0 focus:ring-primary/30">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department && (
          <p className="text-xs text-destructive">{errors.department.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admin-password" className="text-sm text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            {...register("password")}
            className="rounded-xl bg-secondary/50 border-0 pr-10 focus-visible:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrength password={password} />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admin-confirmPassword" className="text-sm text-foreground">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="admin-confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            {...register("confirmPassword")}
            className="rounded-xl bg-secondary/50 border-0 pr-10 focus-visible:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-11"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};