import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { apiService } from "@/services/api";
import { 
  User, Mail, Phone, Calendar, School, Landmark, ChevronRight, 
  ShieldCheck, Github, Linkedin, Briefcase, Award, FileText, 
  Download, Upload, ExternalLink, GraduationCap, MapPin, 
  Database, Layout, Server, Clock, XCircle, RefreshCcw
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async (user: any, quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    
    try {
      const token = await user.getIdToken(true); // Force refresh token to get latest data
      const profile = await apiService.getUser(token);
      
      if (profile.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }
      
      setUserData(profile);
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      if (error.message?.includes("User not found") || error.status === 404) {
        toast.info("Please complete your profile to continue");
        navigate("/profile");
      } else {
        toast.error("Failed to load profile details");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      <div className="relative min-h-screen flex items-center justify-center bg-ghost-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-semibold text-deep-slate animate-pulse tracking-tighter">SYNCHRONIZING PORTFOLIO...</p>
        </div>
      </div>
    );
  }

  const projects = Array.isArray(userData?.projects) ? userData.projects : [];
  const skills = Array.isArray(userData?.skills) ? userData.skills : [];
  const certifications = Array.isArray(userData?.certifications) ? userData.certifications : [];
  const semesters = Array.isArray(userData?.semesters) 
    ? [...userData.semesters].sort((a, b) => {
        if (a.id === Number(userData.semester)) return -1;
        if (b.id === Number(userData.semester)) return 1;
        return a.id - b.id;
      }) 
    : [];

  return (
    <div className="relative min-h-screen bg-ghost-white pt-24 pb-12 font-inter">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-8 flex justify-between items-end">
           <div>
             <h1 className="text-3xl font-black text-deep-slate">STUDENT <span className="text-electric-blue">DASHBOARD</span></h1>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time academic & professional overview</p>
           </div>
           <button 
             onClick={() => auth.currentUser && fetchProfile(auth.currentUser, true)}
             className={`p-3 rounded-2xl glass border border-slate-200 text-slate-400 hover:text-electric-blue transition-all ${refreshing ? 'animate-spin text-electric-blue' : ''}`}
           >
             <RefreshCcw className="w-5 h-5" />
           </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR (25%) */}
          <aside className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-electric-blue/5 blur-2xl -mr-8 -mt-8" />
              <div className="text-center space-y-6 relative z-10">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-[2rem] bg-deep-slate flex items-center justify-center text-white text-4xl font-black shadow-2xl mx-auto border-4 border-white overflow-hidden">
                    {userData?.photoURL ? (
                      <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userData?.fullName?.[0] || "?"
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-deep-slate tracking-tight">{userData?.fullName || "Candidate"}</h2>
                  <p className="text-[10px] font-black text-electric-blue uppercase tracking-[0.2em] border border-electric-blue/20 rounded-lg inline-block px-3 py-1">
                    {userData?.semester ? `Semester ${userData.semester}` : "LEVEL 0"}
                  </p>
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5 uppercase">
                      <MapPin className="w-3 h-3" /> Jammu, India
                    </p>
                  </div>
                </div>

                <div className="pt-4 text-left px-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Top Skills</h4>
                    <button 
                      onClick={() => navigate("/profile#Skills-&-Socials")}
                      className="text-[10px] font-black text-slate-400 hover:text-electric-blue uppercase transition-colors"
                    >
                      {skills.length > 0 ? "Update" : "Add"}
                    </button>
                  </div>
                  {skills.length > 0 ? (
                    <>
                      <ul className="space-y-2">
                        {(showAllSkills ? skills : skills.slice(0, 5)).map((skill: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-600 font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-electric-blue shrink-0" />
                            <span className="truncate">{skill}</span>
                          </li>
                        ))}
                      </ul>
                      {skills.length > 5 && (
                        <button 
                          onClick={() => setShowAllSkills(!showAllSkills)}
                          className="mt-4 text-[10px] font-black text-electric-blue hover:text-blue-600 uppercase tracking-widest w-full text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          {showAllSkills ? "Show Less" : `View All (${skills.length})`}
                          <ChevronRight className={`w-3 h-3 transition-transform ${showAllSkills ? "-rotate-90" : "rotate-90"}`} />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2">No skills added yet.</p>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4 text-left">
                  <div className="group">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 ml-1">E-Mail Address</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600 group-hover:text-electric-blue transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-electric-blue/10">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="truncate font-bold tracking-tight">{userData?.email}</span>
                    </div>
                  </div>
                  
                  <div className="group">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 ml-1">CONTACT NUMBER</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600 group-hover:text-electric-blue transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-electric-blue/10">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="truncate font-bold tracking-tight">{userData?.phone || "NOT LINKED"}</span>
                    </div>
                  </div>
                </div>

                {userData?.resumeURL && (
                  <div className="pt-4">
                    <a 
                      href={userData.resumeURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-electric-blue text-white shadow-lg shadow-electric-blue/20 hover:shadow-electric-blue/40 hover:-translate-y-1 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Download Resume</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-[2rem] border border-slate-200/50 shadow-sm"
            >
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 pl-2">Portal Access</h3>
              <nav className="space-y-1">
                {[
                  { name: "Examination Form", icon: FileText },
                  { name: "Result Portal", icon: GraduationCap },
                  { name: "Fee Receipts", icon: Database },
                  { name: "Academic Calendar", icon: Calendar },
                ].map((item) => (
                  <button key={item.name} className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 group transition-all text-left border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 group-hover:text-electric-blue group-hover:bg-electric-blue/10 transition-all">
                        <item.icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-deep-slate">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-electric-blue transition-all" />
                  </button>
                ))}
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-[2rem] border border-slate-200/50 shadow-sm"
            >
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 pl-2">Sync Connect</h3>
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={userData?.githubUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl bg-slate-900 text-white hover:bg-black transition-all hover:-translate-y-1 shadow-lg shadow-black/10"
                >
                  <Github className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase">GitHub</span>
                </a>
                <a 
                  href={userData?.linkedinUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl bg-[#0077b5] text-white hover:bg-[#005582] transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/10"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase">LinkedIn</span>
                </a>
              </div>
            </motion.div>
          </aside>

          {/* CENTER COLUMN (50%) */}
          <main className="lg:col-span-2 space-y-10">
            {/* Status Alert */}
            {userData?.status !== "approved" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-[2rem] flex items-center gap-6 border-2 transition-all shadow-xl ${
                  userData?.status === "rejected" 
                  ? "bg-red-50 border-red-100 text-red-900 shadow-red-500/5" 
                  : "bg-amber-50 border-amber-100 text-amber-900 shadow-amber-500/5"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  userData?.status === "rejected" ? "bg-red-100/50" : "bg-amber-100/50"
                }`}>
                  {userData?.status === "rejected" ? <XCircle className="w-7 h-7 text-red-600" /> : <Clock className="w-7 h-7 text-amber-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black tracking-tight leading-none mb-1">
                    {userData?.status === "rejected" ? "Identity Update Required" : "Institutional Verification"}
                  </p>
                  <p className="text-xs font-medium opacity-70">
                    {userData?.status === "rejected" 
                      ? userData.rejectionRemarks || "Information mismatch found. Please fix in the editor."
                      : "Identity verification is being processed by the university registrar."}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/profile#Profile-&-Bio")}
                  className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
                  userData?.status === "rejected" ? "bg-red-600 text-white hover:bg-red-700 shadow-red-500/30" : "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/30"
                }`}>
                  {userData?.status === "rejected" ? "Fix Identity" : "View Editor"}
                </button>
              </motion.div>
            )}

            {/* Professional Summary */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-black flex items-center gap-3 text-deep-slate italic">
                  <User className="w-6 h-6 text-electric-blue not-italic" />
                  PROFESSIONAL SUMMARY
                </h3>
                <button 
                  onClick={() => navigate("/profile#Profile-&-Bio")}
                  className="text-[10px] font-black text-slate-300 hover:text-electric-blue uppercase tracking-widest transition-colors"
                >
                  Edit Summary
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-10 rounded-[2.5rem] border border-slate-200/50 shadow-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-electric-blue/[0.03] blur-3xl -mr-20 -mt-20 group-hover:bg-electric-blue/[0.07] transition-all duration-1000" />
                <div className="relative italic font-medium text-slate-600 leading-loose text-lg">
                  {userData?.professionalSummary ? (
                    userData.professionalSummary
                  ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                       <p className="text-slate-300 not-italic uppercase font-bold text-[10px] tracking-[0.4em] mb-4">Master Identity Segment Empty</p>
                       <p className="opacity-50">Click 'Edit Summary' above to craft your professional narrative for the portal registrar and recruiters.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </section>

            {/* Academic Journey */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-black flex items-center gap-3 text-deep-slate italic">
                  <School className="w-6 h-6 text-electric-blue not-italic" />
                  ACADEMIC JOURNEY
                </h3>
                <button 
                  onClick={() => navigate("/profile#Academic-Records")}
                  className="text-[10px] font-black text-slate-300 hover:text-electric-blue uppercase tracking-widest transition-colors"
                >
                  Verify History
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {semesters.filter((s: any) => s.cgpa).map((item: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 rounded-[2rem] border border-slate-200 shadow-md hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-electric-blue/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-electric-blue/10 transition-all group-hover:rotate-12">
                        <GraduationCap className="w-6 h-6 text-slate-400 group-hover:text-electric-blue" />
                      </div>
                      {item.id === Number(userData?.semester) && (
                        <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active Role
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1 italic">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Tier Assessment</h4>
                        {item.marksheetUrl && (
                          <a 
                            href={item.marksheetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                          >
                            <FileText className="w-3 h-3" />
                            Marksheet
                          </a>
                        )}
                      </div>
                      <p className="text-xl font-black text-deep-slate mb-4">Semester {item.id < 10 ? `0${item.id}` : item.id}</p>
                      
                      <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                        <span className="text-4xl font-black text-electric-blue tracking-tighter">{item.cgpa}</span>
                        <div className="space-y-0 text-left">
                          <p className="text-[10px] font-black text-slate-300 uppercase leading-none">Cumulative</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase leading-none">GPA Metric</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {semesters.filter((s: any) => s.cgpa).length === 0 && (
                  <div className="p-16 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center md:col-span-2 group hover:border-electric-blue/20 transition-all cursor-pointer" onClick={() => navigate("/profile")}>
                    <Plus className="w-10 h-10 text-slate-200 mb-4 group-hover:text-electric-blue transition-all" />
                    <p className="text-slate-300 text-xs font-black uppercase tracking-[0.3em]">No Academic Artifacts Logged</p>
                  </div>
                )}
              </div>
            </section>

            {/* Research & Projects */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-black flex items-center gap-3 text-deep-slate italic">
                  <Briefcase className="w-6 h-6 text-electric-blue not-italic" />
                  PROJECT PORTFOLIO
                </h3>
                <button 
                  onClick={() => navigate("/profile#Projects-&-Research")}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-electric-blue/10 text-slate-400 hover:text-electric-blue transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-6">
                {projects.map((proj, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass p-8 rounded-[2.5rem] border border-slate-200 shadow-lg space-y-6 hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute bottom-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                       <Briefcase className="w-32 h-32" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-electric-blue uppercase tracking-widest mb-1 italic">Verified Research Asset</p>
                        <h4 className="text-2xl font-black text-deep-slate group-hover:text-electric-blue transition-colors tracking-tighter uppercase">
                          {proj.title}
                        </h4>
                      </div>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <p className="text-md text-slate-500 font-medium leading-relaxed italic relative z-10">
                      {proj.description || "No description provided for this research initiative."}
                    </p>
                    <div className="flex flex-wrap gap-2.5 relative z-10 pt-2">
                      {Array.isArray(proj.stack) ? proj.stack.map(s => (
                        <span key={s} className="px-4 py-1.5 rounded-xl bg-deep-slate text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                          {s}
                        </span>
                      )) : null}
                    </div>
                  </motion.div>
                ))}
              </div>

              {projects.length === 0 && (
                <div className="py-20 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center gap-4 group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => navigate("/profile")}>
                   <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 group-hover:text-electric-blue transition-all group-hover:rotate-6">
                      <Briefcase className="w-8 h-8" />
                   </div>
                   <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">No Case Studies Logged</p>
                </div>
              )}
            </section>
          </main>

          {/* RIGHT SIDEBAR (25%) */}
          <aside className="lg:col-span-1 space-y-8">


            {/* Certifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-8 rounded-[2.5rem] border border-slate-200/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Certificates</h3>
                <button onClick={() => navigate("/profile#Certificates")} className="text-[10px] font-black text-electric-blue uppercase tracking-widest hover:underline">Revise</button>
              </div>
              <div className="space-y-6">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-electric-blue/10 transition-all border border-transparent group-hover:border-electric-blue/10">
                      <Award className="w-6 h-6 text-slate-300 group-hover:text-electric-blue" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-deep-slate group-hover:text-electric-blue transition-colors line-clamp-1 italic">{cert.name || "Untitled Credential"}</h4>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{cert.issuer} • {cert.year}</p>
                    </div>
                  </div>
                ))}
                {certifications.length === 0 && (
                   <p className="text-[10px] text-slate-300 italic text-center py-4">No verified certifications found</p>
                )}
              </div>
            </motion.div>

            {/* Resume Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-deep-slate p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all duration-700" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white italic tracking-tight">RESUME VAULT</h4>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Digital Asset v2.0</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if (userData?.resumeURL) {
                        window.open(userData.resumeURL, "_blank");
                      } else {
                        toast.error("No resume found in vault");
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl border border-white/10 ${
                      userData?.resumeURL 
                      ? 'bg-electric-blue hover:bg-blue-600 shadow-electric-blue/40' 
                      : 'bg-slate-700/50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    PULL
                  </button>
                  <button 
                    onClick={() => navigate("/profile#Skills-&-Socials")}
                    className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-center font-black text-white/30 uppercase tracking-[0.2em] pt-2">Last Modified: {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : "PENDING SYNC"}</p>
              </div>
            </motion.div>
          </aside>

        </div>
      </div>
    </div>
  );
};

// Internal Plus icon component
const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default Dashboard;
