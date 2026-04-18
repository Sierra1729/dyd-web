import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminProfileSchema, type AdminProfileData } from "@/lib/validators";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { apiService } from "@/services/api";
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
import { Loader2 } from "lucide-react";
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

export const AdminProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminProfileData>({
    resolver: zodResolver(adminProfileSchema),
  });

  const onSubmit = async (data: AdminProfileData) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Session expired. Please log in again.");
      
      const token = await user.getIdToken(true);

      const userData = {
        fullName: data.fullName,
        phone: data.phone,
        department: data.department,
      };

      await apiService.saveUser(userData, token);

      await signOut(auth);
      toast.success("Profile submitted! It is now under review. You will be notified once approved.");
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save profile");
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
            setValue("department", val as AdminProfileData["department"], {
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