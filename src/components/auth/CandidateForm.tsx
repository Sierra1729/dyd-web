import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateSchema, type CandidateData } from "@/lib/validators";
import { PasswordStrength } from "./PasswordStrength";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const CandidateForm = () => {
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
  } = useForm<CandidateData>({
    resolver: zodResolver(candidateSchema),
  });

  const password = watch("password", "");
  const dob = watch("dateOfBirth");

  const onSubmit = async (data: CandidateData) => {
    setLoading(true);
    try {
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
      const userData = {
        fullName: data.fullName,
        fatherName: data.fatherName,
        rollNo: data.rollNo,
        enrollmentYear: Number(data.enrollmentYear),
        semester: Number(data.semester),
        domain: data.domain || "",
        dob: data.dateOfBirth,
        phone: data.phone,
      };

      console.log("📝 Captured Registration Data:", userData);
      localStorage.setItem("userData", JSON.stringify(userData));

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
        <Label htmlFor="fullName" className="text-sm text-foreground">
          Full Name
        </Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          {...register("fullName")}
          className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm text-foreground">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fatherName" className="text-sm text-foreground">
          Father's Name
        </Label>
        <Input
          id="fatherName"
          placeholder="Enter father's name"
          {...register("fatherName")}
          className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
        />
        {errors.fatherName && (
          <p className="text-xs text-destructive">{errors.fatherName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="rollNo" className="text-sm text-foreground">
            Roll Number
          </Label>
          <Input
            id="rollNo"
            placeholder="DYD-24-001"
            {...register("rollNo")}
            className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
          />
          {errors.rollNo && (
            <p className="text-xs text-destructive">{errors.rollNo.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="enrollmentYear" className="text-sm text-foreground">
            Enrollment Year
          </Label>
          <select
            id="enrollmentYear"
            {...register("enrollmentYear")}
            className="w-full h-10 px-3 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 text-sm text-foreground outline-none"
          >
            <option value="">Select Year</option>
            {[23, 24, 25, 26].map((y) => (
              <option key={y} value={y}>
                20{y}
              </option>
            ))}
          </select>
          {errors.enrollmentYear && (
            <p className="text-xs text-destructive">{errors.enrollmentYear.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="semester" className="text-sm text-foreground">
          Current Semester
        </Label>
        <select
          id="semester"
          {...register("semester")}
          className="w-full h-10 px-3 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 text-sm text-foreground outline-none"
        >
          <option value="">Select Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
        {errors.semester && (
          <p className="text-xs text-destructive">{errors.semester.message}</p>
        )}
      </div>

      {(Number(watch("enrollmentYear")) === 23 && Number(watch("semester")) >= 5) && (
        <div className="space-y-1.5">
          <Label htmlFor="domain" className="text-sm text-foreground">
            Major Domain
          </Label>
          <Input
            id="domain"
            placeholder="e.g. Computer Science"
            {...register("domain")}
            className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
          />
          {errors.domain && (
            <p className="text-xs text-destructive">{errors.domain.message}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-sm text-foreground">Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal rounded-xl bg-secondary/50 border-0",
                !dob && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dob ? format(dob, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dob}
              onSelect={(date) =>
                date && setValue("dateOfBirth", date, { shouldValidate: true })
              }
              disabled={(date) =>
                date > new Date() || date < new Date("1950-01-01")
              }
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {errors.dateOfBirth && (
          <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-sm text-foreground">
          Phone Number
        </Label>
        <Input
          id="phone"
          placeholder="+91 9876543210"
          {...register("phone")}
          className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
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
        <Label htmlFor="confirmPassword" className="text-sm text-foreground">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
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