import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { apiService } from "@/services/api";
import { User, Mail, Phone, Calendar, School, Landmark, ChevronRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (user: any) => {
    try {
      const token = await user.getIdToken();
      const profile = await apiService.getUser(token);
      
      if (profile.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }
      
      setUserData(profile);
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <CosmicBackground />
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-8 md:py-12 pt-24 md:pt-28">
      <CosmicBackground />
      <Navbar />
      
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Candidate Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome back, {userData?.fullName}</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:col-span-1 space-y-6"
          >
            <GlassCard className="p-6 text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto">
                  {userData?.fullName?.[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-green-500 border-4 border-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{userData?.fullName}</h2>
                <p className="text-sm text-primary font-medium uppercase tracking-wider">Candidate</p>
              </div>
              <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg bg-secondary/30">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="truncate">{userData?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg bg-secondary/30">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{userData?.phone || "No phone linked"}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 tracking-widest">Portal Access</h3>
              <div className="space-y-2">
                {["Examination Form", "Result Portal", "Fee Receipts"].map((item) => (
                  <button key={item} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-all">
                    <span className="text-sm text-foreground">{item}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all" />
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:col-span-2 space-y-6"
          >
            {/* Status Card */}
            <GlassCard className="p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all duration-700" />
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Registration Status</h3>
                  <p className="text-muted-foreground">Your account is currently under institutional review.</p>
                </div>
                <div className="md:ml-auto">
                  <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20 uppercase tracking-tighter">
                    Pending Verification
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Details Grid */}
            <h3 className="text-lg font-semibold text-foreground px-2">Academic Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <GlassCard className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <School className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Assigned School</span>
                </div>
                <p className="text-lg font-medium text-foreground">{userData?.school || "Not Assigned"}</p>
              </GlassCard>

              <GlassCard className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Landmark className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Department</span>
                </div>
                <p className="text-lg font-medium text-foreground">{userData?.department || "General Administration"}</p>
              </GlassCard>

              <GlassCard className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Date of Birth</span>
                </div>
                <p className="text-lg font-medium text-foreground">
                  {userData?.dob ? new Date(userData.dob).toLocaleDateString() : "Not Provided"}
                </p>
              </GlassCard>

              <GlassCard className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Father's Name</span>
                </div>
                <p className="text-lg font-medium text-foreground">{userData?.fatherName || "N/A"}</p>
              </GlassCard>
            </div>

            {/* Updates Section */}
            <GlassCard className="p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">Recent Notifications</h3>
              <div className="space-y-4">
                {[
                  "Welcome to the University of Jammu academic portal.",
                  "Please verify your contact details for further communication."
                ].map((msg, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                    <div className="w-2 h-2 rounded-full gradient-primary shrink-0 mt-2" />
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{msg}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
