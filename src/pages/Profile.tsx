import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { apiService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Save, 
  Lock,
  ArrowLeft,
  CheckCircle2,
  Info,
  Award,
  BookOpen,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GuidanceCard } from "@/components/profile/GuidanceCard";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dob: "",
    fatherName: "",
    department: "",
    interests: "",
    specializations: "",
    email: "", // User can update email
  });
  const [showGuidance, setShowGuidance] = useState(false);

  const fetchProfile = async (firebaseUser: any) => {
    try {
      const token = await firebaseUser.getIdToken();
      const profile = await apiService.getUser(token);
      setUser(profile);
      setFormData({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        dob: profile.dob ? profile.dob.split("T")[0] : "",
        fatherName: profile.fatherName || "",
        department: profile.department || profile.domain || "",
        interests: Array.isArray(profile.interests) ? profile.interests.join(", ") : profile.interests || "",
        specializations: Array.isArray(profile.specializations) ? profile.specializations.join(", ") : profile.specializations || "",
        email: profile.email || ""
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        fetchProfile(firebaseUser);
        // Show guidance if interests are missing after a short delay
        setTimeout(() => setShowGuidance(true), 1500);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      
      const updateData = {
        ...formData,
        interests: formData.interests.split(",").map(i => i.trim()).filter(i => i !== ""),
        specializations: formData.specializations.split(",").map(s => s.trim()).filter(s => s !== "")
      };

      await apiService.updateProfile(updateData, token);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (!user?.email) return;
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Password reset link sent to your email! 📩");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <CosmicBackground />
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4">
      <CosmicBackground />
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link 
            to={isAdmin ? "/admin/dashboard" : "/dashboard"}
            className="p-2 rounded-xl glass border border-white/5 text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 rounded-full text-muted-foreground hover:text-primary transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 glass border-white/10 shadow-2xl">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">Next Steps Guide 🚀</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      1. Verify your <strong>Roll Number</strong> & <strong>Semester</strong>.<br/>
                      2. Update your <strong>Interests</strong> to get tailored dashboard reports.<br/>
                      3. List your <strong>Specializations</strong> for professional visibility.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-muted-foreground">Manage your account and personal preferences</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar / Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <GlassCard className="p-6 text-center space-y-4">
              <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto uppercase">
                {user?.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground truncate px-2">{user?.fullName}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </div>
              </div>
              <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
            </GlassCard>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-4 border-primary/20 bg-primary/5">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Correction Notice</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      To correct sensitive info (Name, Roll No, Email, or Sem), contact: 
                      <span className="block font-bold text-foreground">alpha.bravo0796@gmail.com</span>
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-4 h-4" /> Account Security
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/30 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Password</p>
                  <button 
                    onClick={handlePasswordReset}
                    className="mt-1 flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Reset via Email
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Member Since</p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 text-left"
          >
            <TooltipProvider>
              <GlassCard className="p-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 sm:col-span-1 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Full Name (Read Only)
                    </label>
                    <input 
                      disabled
                      className="w-full bg-secondary/10 border border-white/5 rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                      value={formData.fullName}
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> Roll Number
                    </label>
                    <input 
                      disabled
                      className="w-full bg-secondary/10 border border-white/5 rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed font-medium"
                      value={user?.rollNo || "Not Assigned"}
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Date of Birth
                    </label>
                    <input 
                      type="date"
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Father's Name</label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                      placeholder="Legal Father/Guardian Name"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" /> Semester (Read Only)
                    </label>
                    <input 
                      disabled
                      className="w-full bg-secondary/10 border border-white/5 rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed font-bold"
                      value={user?.semester ? `Semester ${user.semester}` : "Not Set"}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 cursor-help">
                          <Award className="w-3.5 h-3.5" /> Specializations <Info className="w-3 h-3 text-primary" />
                        </label>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs text-[11px]">List your major academic or professional focus areas. This helps in tailoring your dashboard insights.</p>
                      </TooltipContent>
                    </Tooltip>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={formData.specializations}
                      onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                      placeholder="e.g. AI, Cyber Security"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 text-left">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 cursor-help">
                          Interests <Info className="w-3 h-3 text-primary" />
                        </label>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs text-[11px]">Sharing your interests helps the University suggest appropriate research domains and extracurricular activities.</p>
                      </TooltipContent>
                    </Tooltip>
                    <textarea 
                      rows={2}
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                      value={formData.interests}
                      onChange={(e) => setFormData({...formData, interests: e.target.value})}
                      placeholder="e.g. Web Development, Photography, Space Research"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={saving}
                    type="submit" 
                    className="w-full py-4 rounded-2xl gradient-primary text-white font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
              </GlassCard>
            </TooltipProvider>
          </motion.div>
        </div>

        <AnimatePresence>
          {showGuidance && (!formData.interests || !formData.specializations) && (
            <GuidanceCard 
              title="Enhance Your Profile 🚀"
              description="Complete your Interests and Specializations to unlock personalized dashboard insights and research suggestions."
              onClose={() => setShowGuidance(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
