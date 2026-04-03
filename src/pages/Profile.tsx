import { useState, useEffect } from "react";
import { auth } from "../firebase";
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
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dob: "",
    fatherName: "",
    school: "",
    department: ""
  });

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
        school: profile.school || "",
        department: profile.department || ""
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
      await apiService.updateProfile(formData, token);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
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
              <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto">
                {user?.fullName?.[0]}
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

            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-4 h-4" /> Account Details
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/30 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Member Since</p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Verification</p>
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <GlassCard className="p-8">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 sm:col-span-1 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Your full legal name"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email Address (Read Only)
                    </label>
                    <input 
                      disabled
                      className="w-full bg-secondary/10 border border-white/5 rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                      value={user?.email}
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
                    <label className="text-xs font-bold text-muted-foreground uppercase">Department</label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase">School / Institution</label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={formData.school}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                      placeholder="e.g. University of Jammu Main Campus"
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
