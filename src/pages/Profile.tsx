import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { apiService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Save, 
  Lock,
  ArrowLeft,
  Info,
  Award,
  BookOpen,
  Key,
  ShieldCheck,
  X,
  Plus,
  Compass,
  FileText,
  Upload,
  Briefcase,
  Github,
  Linkedin,
  FileUp,
  ChevronRight,
  Trash2,
  ExternalLink,
  GraduationCap,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("Profile & Bio");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    fatherName: "",
    semester: "",
    professionalSummary: "",
    githubUrl: "",
    linkedinUrl: "",
    photoURL: "",
    interests: "",
    skills: [] as string[],
    projects: [] as any[],
    certifications: [] as any[],
    semesters: [
      { id: 1, cgpa: "", marksheetUrl: null },
      { id: 2, cgpa: "", marksheetUrl: null },
      { id: 3, cgpa: "", marksheetUrl: null },
      { id: 4, cgpa: "", marksheetUrl: null },
    ]
  });

  // Individual refs for stable hooks
  const profileBioRef = useRef<HTMLDivElement>(null);
  const academicRecordsRef = useRef<HTMLDivElement>(null);
  const projectsResearchRef = useRef<HTMLDivElement>(null);
  const skillsSocialsRef = useRef<HTMLDivElement>(null);
  const accountSecurityRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    "Profile & Bio": profileBioRef,
    "Academic Records": academicRecordsRef,
    "Projects & Research": projectsResearchRef,
    "Skills & Socials": skillsSocialsRef,
    "Account Security": accountSecurityRef,
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    sectionRefs[section]?.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const fetchProfile = async (firebaseUser: any) => {
    try {
      const token = await firebaseUser.getIdToken();
      const profile = await apiService.getUser(token);
      setUser(profile);
      
      setFormData(prev => ({
        ...prev,
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dob: profile.dob ? profile.dob.split("T")[0] : "",
        fatherName: profile.fatherName || "",
        semester: profile.semester || "",
        professionalSummary: profile.professionalSummary || "",
        githubUrl: profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        photoURL: profile.photoURL || "",
        interests: Array.isArray(profile.interests) ? profile.interests.join(", ") : profile.interests || "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        projects: Array.isArray(profile.projects) ? profile.projects : [],
        certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
        semesters: Array.isArray(profile.semesters) ? profile.semesters : prev.semesters,
      }));
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setErrorState(error.message || "Failed to load profile");
      toast.error(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // HOOKS MUST BE BEFORE EARLY RETURNS
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        fetchProfile(firebaseUser);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !errorState) {
      const sectionFromHash = window.location.hash.replace("#", "").replace(/-/g, " ");
      const validSections = ["Profile & Bio", "Academic Records", "Projects & Research", "Skills & Socials", "Account Security"];
      
      if (sectionFromHash && validSections.includes(sectionFromHash)) {
        setTimeout(() => scrollToSection(sectionFromHash), 500);
      }
    }
  }, [loading, errorState]);

  // Generic Field Update
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Semester Handler
  const handlePhotoUpload = async (file: File) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      
      const toastId = toast.loading("Updating profile photo...");
      const response = await apiService.uploadProfilePhoto(file, token);
      
      updateField("photoURL", response.url);
      
      // Also update the local state for the section
      await apiService.updateProfile({ ...formData, photoURL: response.url }, token);
      
      toast.success("Profile photo updated", { id: toastId });
      await fetchProfile(firebaseUser); // Refresh all data
    } catch (error: any) {
      toast.error(error.message || "Photo upload failed");
    }
  };

  const addSemester = () => {
    const nextId = formData.semesters.length > 0 
      ? Math.max(...formData.semesters.map(s => s.id)) + 1 
      : 1;
    const newSem = { id: nextId, cgpa: "", marksheetUrl: null };
    setFormData(prev => ({ ...prev, semesters: [...prev.semesters, newSem] }));
  };

  const removeSemester = (id: number) => {
    setFormData(prev => ({ 
      ...prev, 
      semesters: prev.semesters.filter(s => s.id !== id) 
    }));
  };

  const updateSemester = (id: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handleMarksheetUpload = async (id: number, file: File) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      
      const toastId = toast.loading(`Uploading marksheet for Semester ${id}...`);
      const response = await apiService.uploadMarksheet(file, token);
      
      updateSemester(id, "marksheetUrl", response.url);
      toast.success("Marksheet uploaded", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    }
  };

  // Projects CRUD
  const addProject = () => {
    const newProject = { title: "New Project", description: "", stack: [], link: "" };
    setFormData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  // Certifications CRUD
  const addCertification = () => {
    const newCert = { name: "", issuer: "", year: new Date().getFullYear().toString() };
    setFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };

  const updateCertification = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (!formData.skills.includes(val)) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, val] }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSaveSection = async (sectionName: string) => {
    const toastId = toast.loading(`Saving ${sectionName}...`);
    setSaving(sectionName);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      await apiService.updateProfile(formData, token);
      toast.success(`${sectionName} updated successfully`, { id: toastId });
      // Re-fetch to confirm persistence
      await fetchProfile(firebaseUser);
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes", { id: toastId });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-ghost-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Initializing Master Editor...</p>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-ghost-white px-4">
        <div className="max-w-md w-full glass p-10 rounded-[2.5rem] border border-red-100 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-deep-slate uppercase tracking-tight">Access Restricted</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{errorState}</p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
             <button 
               onClick={() => window.location.reload()}
               className="w-full py-4 rounded-2xl bg-deep-slate text-white font-black text-xs uppercase tracking-widest shadow-xl"
             >
               Retry Connection
             </button>
             <Link 
               to="/dashboard"
               className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest"
             >
               Back to Dashboard
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ghost-white min-h-screen pt-28 pb-12 px-4 font-inter selection:bg-electric-blue/30 overflow-hidden">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard"
              className="p-3 rounded-2xl glass border border-slate-200 text-slate-400 hover:text-deep-slate transition-all hover:border-slate-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-deep-slate">
                MASTER <span className="text-electric-blue underline underline-offset-8 decoration-4">PROFILE</span> EDITOR
              </h1>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1 italic">Manage every detail of your professional dashboard</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* NAVIGATION SIDEBAR */}
          <nav className="lg:col-span-3 space-y-2 sticky top-32">
            {[
              { id: "Profile & Bio", icon: User },
              { id: "Academic Records", icon: GraduationCap },
              { id: "Projects & Research", icon: Briefcase },
              { id: "Skills & Socials", icon: Award },
              { id: "Account Security", icon: Lock },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  activeSection === section.id 
                  ? "bg-deep-slate text-white shadow-xl translate-x-2" 
                  : "glass hover:bg-slate-50 text-slate-500 border border-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <section.icon className={`w-5 h-5 ${activeSection === section.id ? "text-electric-blue" : "group-hover:text-electric-blue transition-colors"}`} />
                  <span className="font-bold text-sm tracking-tight">{section.id}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === section.id ? "rotate-90 opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
              </button>
            ))}
          </nav>

          {/* MAIN EDITOR AREA */}
          <main className="lg:col-span-9 space-y-12 scroll-mt-32 max-h-[calc(100vh-200px)] overflow-y-auto pr-4 custom-scrollbar pb-24">
            
            {/* Profile & Bio Section */}
            <section ref={sectionRefs["Profile & Bio"]} className="space-y-6">
              <div className="glass rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="text-xl font-black text-deep-slate flex items-center gap-3">
                      <User className="w-6 h-6 text-electric-blue" />
                      PROFILE & BIO
                    </h2>
                    <button 
                      onClick={() => handleSaveSection("Profile & Bio")}
                      className="px-6 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-black shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                      {saving === "Profile & Bio" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      UPDATE BIO
                    </button>
                  </div>

                  <div className="grid md:grid-cols-12 gap-8">
                    <label className="md:col-span-4 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-3xl group hover:border-electric-blue transition-all cursor-pointer relative overflow-hidden">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(file);
                          }}
                        />
                        <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center mb-4 overflow-hidden relative border-2 border-slate-100 group-hover:border-electric-blue/30 transition-all">
                          {formData.photoURL ? (
                            <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-8 h-8 text-slate-300 group-hover:text-electric-blue transition-colors" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Plus className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Photo</span>
                    </label>

                    <div className="md:col-span-8 space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Professional Summary (500 Chars)</label>
                        <textarea 
                          rows={5}
                          value={formData.professionalSummary}
                          onChange={(e) => updateField("professionalSummary", e.target.value.slice(0, 500))}
                          className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-deep-slate font-medium text-sm focus:border-electric-blue outline-none transition-all resize-none"
                          placeholder="Highlight your academic focus and research goals..."
                        />
                      </div>
                    </div>
                  </div>
              </div>
            </section>

            {/* Academic records */}
            <section ref={sectionRefs["Academic Records"]} className="space-y-6">
              <div className="glass rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="text-xl font-black text-deep-slate flex items-center gap-3">
                      <GraduationCap className="w-6 h-6 text-electric-blue" />
                      ACADEMIC MANAGER
                    </h2>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={addSemester}
                        className="flex items-center gap-2 text-[10px] font-black text-electric-blue hover:translate-x-1 transition-all uppercase tracking-widest border border-electric-blue/20 px-4 py-2 rounded-xl hover:bg-electric-blue/5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        ADD SEMESTER
                      </button>
                      <button 
                        onClick={() => handleSaveSection("Academic Records")}
                        className="px-6 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-black shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                      >
                        {saving === "Academic Records" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        SYNC GRADES
                      </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase">Current</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase">Semester</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase text-center">CGPA</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase text-right">Marksheet Artifact</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {formData.semesters.map((sem) => (
                        <tr key={sem.id} className="group">
                          <td className="py-6">
                            <input 
                              type="radio"
                              name="currentSemester"
                              checked={Number(formData.semester) === sem.id}
                              onChange={() => updateField("semester", sem.id)}
                              className="w-5 h-5 accent-electric-blue cursor-pointer"
                            />
                          </td>
                          <td className="py-6 font-bold text-deep-slate">Semester 0{sem.id}</td>
                          <td className="py-6">
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-20 mx-auto block px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center font-black text-electric-blue"
                              value={sem.cgpa}
                              onChange={(e) => updateSemester(sem.id, "cgpa", e.target.value)}
                            />
                          </td>
                          <td className="py-6 text-right">
                             <div className="flex flex-col items-end gap-1">
                                {sem.marksheetUrl ? (
                                  <a href={sem.marksheetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-500 hover:underline">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    VIEW MARKSHEET
                                  </a>
                                ) : null}
                                <label className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-electric-blue transition-colors cursor-pointer">
                                  <FileUp className="w-4 h-4" />
                                  {sem.marksheetUrl ? "REPLACE MARKSHEET" : "UPLOAD PDF"}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="application/pdf,image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleMarksheetUpload(sem.id, file);
                                    }}
                                  />
                                </label>
                             </div>
                          </td>
                          <td className="py-6 text-right">
                            <button 
                              onClick={() => removeSemester(sem.id)}
                              className="p-2.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Projects */}
            <section ref={sectionRefs["Projects & Research"]} className="space-y-6">
              <div className="glass rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="text-xl font-black text-deep-slate flex items-center gap-3">
                      <Briefcase className="w-6 h-6 text-electric-blue" />
                      PROJECT PORTFOLIO
                    </h2>
                    <button 
                      onClick={addProject}
                      className="flex items-center gap-2 text-xs font-black text-electric-blue hover:translate-x-1 transition-all uppercase tracking-widest"
                    >
                      <Plus className="w-4 h-4" />
                      ADD PROJECT
                    </button>
                </div>

                <div className="grid gap-6">
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-electric-blue/30 transition-all group space-y-4">
                       <div className="flex justify-between items-start">
                         <input 
                           className="text-lg font-bold text-deep-slate bg-transparent border-none outline-none focus:ring-1 focus:ring-electric-blue/20 rounded px-1 w-full"
                           value={proj.title}
                           onChange={(e) => updateProject(idx, "title", e.target.value)}
                           placeholder="Project Title"
                         />
                         <button 
                           onClick={() => removeProject(idx)}
                           className="p-2 rounded-lg hover:bg-white text-slate-300 hover:text-red-500 transition-all"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                       <textarea 
                         className="w-full text-xs text-slate-500 bg-transparent border-none outline-none focus:ring-1 focus:ring-electric-blue/20 rounded p-1 resize-none font-medium h-20"
                         value={proj.description}
                         onChange={(e) => updateProject(idx, "description", e.target.value)}
                         placeholder="Project Description..."
                       />
                       <div className="flex items-center gap-4">
                         <div className="relative flex-1">
                           <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                           <input 
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-bold text-slate-600 focus:border-electric-blue outline-none"
                              value={proj.link}
                              onChange={(e) => updateProject(idx, "link", e.target.value)}
                              placeholder="GitHub Repo Link"
                           />
                         </div>
                         <input 
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-black text-slate-600 focus:border-electric-blue outline-none placeholder:text-slate-200"
                            placeholder="TECHS (Comma separated)"
                            value={Array.isArray(proj.stack) ? proj.stack.join(", ") : proj.stack || ""}
                            onChange={(e) => updateProject(idx, "stack", e.target.value.split(",").map((s: string) => s.trim()))}
                         />
                       </div>
                    </div>
                  ))}
                  {formData.projects.length === 0 && (
                    <p className="text-center py-10 text-slate-200 text-xs font-black uppercase tracking-[0.2em]">No Research Projects Logged</p>
                  )}
                </div>
              </div>
            </section>

            {/* Skills & Socials */}
            <section ref={sectionRefs["Skills & Socials"]} className="space-y-6">
               <div className="glass rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="text-xl font-black text-deep-slate flex items-center gap-3">
                      <Award className="w-6 h-6 text-electric-blue" />
                      SKILLS & SOCIALS
                    </h2>
                    <button 
                      onClick={() => handleSaveSection("Skills & Socials")}
                      className="px-6 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-black shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                      {saving === "Skills & Socials" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      SAVE ASSETS
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Skillset Tags</label>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap gap-2">
                        {formData.skills.map(s => (
                          <span key={s} className="px-3 py-1.5 rounded-xl bg-electric-blue text-white text-[10px] font-black flex items-center gap-2">
                            {s} <X className="w-3 h-3 cursor-pointer hover:bg-white/20 rounded-full" onClick={() => removeSkill(s)} />
                          </span>
                        ))}
                        <input 
                          onKeyDown={addSkill}
                          className="bg-transparent text-sm font-bold outline-none flex-1 min-w-[150px] px-2"
                          placeholder="Type and press Enter..."
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">GitHub Profile URL</label>
                        <div className="relative">
                          <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="url"
                            className="w-full pl-11 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-deep-slate focus:border-electric-blue transition-all"
                            value={formData.githubUrl}
                            onChange={(e) => updateField("githubUrl", e.target.value)}
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">LinkedIn URL</label>
                        <div className="relative">
                          <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="url"
                            className="w-full pl-11 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-deep-slate focus:border-electric-blue transition-all"
                            value={formData.linkedinUrl}
                            onChange={(e) => updateField("linkedinUrl", e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Certifications</label>
                         <button onClick={addCertification} className="text-[10px] font-black text-electric-blue uppercase">Add Cert</button>
                       </div>
                       <div className="grid gap-3">
                         {formData.certifications.map((cert, idx) => (
                           <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 items-start">
                             <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input 
                                  className="text-xs font-bold text-deep-slate bg-transparent outline-none border-b border-slate-100 focus:border-electric-blue"
                                  placeholder="Certification Name"
                                  value={cert.name}
                                  onChange={(e) => updateCertification(idx, "name", e.target.value)}
                                />
                                <input 
                                  className="text-xs font-bold text-deep-slate bg-transparent outline-none border-b border-slate-100 focus:border-electric-blue"
                                  placeholder="Issuer"
                                  value={cert.issuer}
                                  onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                                />
                                <input 
                                  className="text-xs font-bold text-deep-slate bg-transparent outline-none border-b border-slate-100 focus:border-electric-blue"
                                  placeholder="Year"
                                  value={cert.year}
                                  onChange={(e) => updateCertification(idx, "year", e.target.value)}
                                />
                             </div>
                             <button onClick={() => removeCertification(idx)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
               </div>
            </section>

            {/* Account Security */}
            <section ref={sectionRefs["Account Security"]} className="space-y-6">
               <div className="glass rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="text-xl font-black text-deep-slate flex items-center gap-3">
                      <Lock className="w-6 h-6 text-electric-blue" />
                      ACCOUNT SECURITY
                    </h2>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-electric-blue shadow-sm">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-deep-slate">Change Password</h4>
                        <p className="text-xs text-slate-400">Request a secure password reset link via email.</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!user?.email) return;
                        try {
                          await sendPasswordResetEmail(auth, user.email);
                          toast.success("Reset link sent!");
                        } catch (e) {
                          toast.error("Failed to send link");
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-deep-slate hover:border-electric-blue shadow-sm transition-all"
                    >
                      SEND RESET LINK
                    </button>
                  </div>
               </div>
            </section>

            {/* Resume Vault */}
            <section className="space-y-6 pb-40">
               <div className="glass rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="text-xl font-black text-deep-slate flex items-center gap-3">
                      <FileUp className="w-6 h-6 text-deep-slate" />
                      RESUME VAULT
                    </h2>
                    <button 
                      onClick={() => handleSaveSection("Resume Vault")}
                      className="px-6 py-2.5 rounded-xl bg-deep-slate text-white text-xs font-black shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      {saving === "Resume Vault" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      SYNC ASSET
                    </button>
                  </div>

                  <div className="group relative w-full py-16 rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-deep-slate transition-all cursor-pointer">
                    <FileUp className="w-12 h-12 text-slate-200 mb-4 group-hover:text-deep-slate transition-colors" />
                    <h4 className="font-black text-sm text-deep-slate">UPLOAD LATEST RESUME</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">PDF Only • Max 5MB</p>
                    <div className="mt-8 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-slate text-white text-[10px] font-black">
                       <Clock className="w-3.5 h-3.5" />
                       LAST UPDATED: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "APR 26, 2024"}
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
               </div>
            </section>
          </main>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default Profile;
