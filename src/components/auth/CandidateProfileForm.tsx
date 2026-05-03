import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateProfileSchema, type CandidateProfileData } from "@/lib/validators";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { apiService } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CandidateProfileFormProps {
  onSuccess?: () => void;
}

export const CandidateProfileForm = ({ onSuccess }: CandidateProfileFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CandidateProfileData>({
    resolver: zodResolver(candidateProfileSchema),
  });

  const dob = watch("dateOfBirth");

  const onSubmit = async (data: CandidateProfileData) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Session expired. Please log in again.");
      
      const token = await user.getIdToken(true);

      const userData = {
        fullName: `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`,
        firstName: data.firstName,
        middleName: data.middleName || "",
        lastName: data.lastName,
        nickName: data.nickName,
        fatherName: data.fatherName,
        rollNo: data.rollNo,
        enrollmentYear: Number(data.enrollmentYear),
        semester: Number(data.semester),
        domain: data.domain || "",
        dob: data.dateOfBirth instanceof Date
          ? data.dateOfBirth.toISOString()
          : String(data.dateOfBirth),
        phone: data.phone,
      };

      await apiService.saveUser(userData, token);

      toast.success("Profile submitted! It is now under review. You will be notified once approved.");
      
      if (onSuccess) {
        onSuccess();
      } else {
        await signOut(auth);
        navigate("/login");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-sm text-foreground">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="First name"
            {...register("firstName")}
            className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="middleName" className="text-sm text-foreground">
            Middle Name
          </Label>
          <Input
            id="middleName"
            placeholder="Middle name"
            {...register("middleName")}
            className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
          />
          {errors.middleName && <p className="text-xs text-destructive">{errors.middleName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-sm text-foreground">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Last name"
            {...register("lastName")}
            className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nickName" className="text-sm text-foreground">
            Nick Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nickName"
            placeholder="Nick name"
            {...register("nickName")}
            className="rounded-xl bg-secondary/50 border-0 focus-visible:ring-primary/30"
          />
          {errors.nickName && <p className="text-xs text-destructive">{errors.nickName.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fatherName" className="text-sm text-foreground">
          Father's Name <span className="text-destructive">*</span>
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
            Roll Number <span className="text-destructive">*</span>
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
            Enrollment Year <span className="text-destructive">*</span>
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
          Current Semester <span className="text-destructive">*</span>
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

      {Number(watch("semester")) >= 5 && (
        <div className="space-y-1.5">
          <Label htmlFor="domain" className="text-sm text-foreground">
            Major Domain <span className="text-destructive">*</span>
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
        <Label className="text-sm text-foreground">Date of Birth <span className="text-destructive">*</span></Label>
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
          Phone Number <span className="text-destructive">*</span>
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

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-11"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {loading ? "Saving Profile..." : "Complete Profile"}
      </Button>
    </form>
  );
};