import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { apiService } from "@/services/api";
import { User, Mail, School, Trash2, Edit2, Search, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  rollNo?: string;
  semester?: number;
  enrollmentYear?: number;
  domain?: string;
  specializations?: string[];
  interests?: string[];
  department?: string;
  school?: string;
  phone?: string;
  dob?: string;
  role?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserData | null>(null);
  
  // Advanced Filters
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");

  const fetchUsers = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const data = await apiService.getAllCandidates(token);
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchUsers();
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      await apiService.deleteCandidate(id, token);
      toast.success("User deleted successfully");
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user || !editingUser) return;
      const token = await user.getIdToken();
      await apiService.updateCandidate(editingUser.id, editingUser, token);
      toast.success("User updated successfully");
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      u.domain?.toLowerCase().includes(search.toLowerCase());

    const matchesSemester = filterSemester === "all" || String(u.semester) === filterSemester;
    const matchesYear = filterYear === "all" || String(u.enrollmentYear) === filterYear;
    const matchesDomain = filterDomain === "all" || u.domain === filterDomain;

    return matchesSearch && matchesSemester && matchesYear && matchesDomain;
  });

  const uniqueDomains = Array.from(new Set(users.map(u => u.domain).filter(Boolean)));

  return (
    <div className="relative min-h-screen px-4 py-12 pt-24 md:pt-28">
      <CosmicBackground />
      <Navbar />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="text-muted-foreground">View and manage all university candidates</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search name, email, roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm text-foreground placeholder:text-muted-foreground/30"
              />
            </div>

            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-2 rounded-xl bg-secondary/30 border border-white/10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Years</option>
              <option value="23">2023</option>
              <option value="24">2024</option>
              <option value="25">2025</option>
              <option value="26">2026</option>
            </select>

            <select 
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="px-4 py-2 rounded-xl bg-secondary/30 border border-white/10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>

            <select 
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-4 py-2 rounded-xl bg-secondary/30 border border-white/10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 max-w-[150px]"
            >
              <option value="all">All Domains</option>
              {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </motion.div>

        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-secondary/20">
                  <th className="p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Candidate</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Academic</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Loading candidates...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-muted-foreground text-sm font-medium">
                        No users matching your search criteria.
                      </td>
                    </tr>
                  ) : filteredUsers.map((user, i) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                            {user.fullName?.[0] || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{user.fullName}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground">
                            {user.rollNo || "No Roll No"}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            {user.semester ? `Semester ${user.semester}` : "Sem N/A"} • 20{user.enrollmentYear}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground">
                            {user.domain || user.department || "General"}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <School className="w-3 h-3" /> {user.school || "Main Campus"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                         <p className="text-sm font-medium text-foreground">{user.phone || "N/A"}</p>
                         <p className="text-[11px] text-muted-foreground">{user.dob ? new Date(user.dob).toLocaleDateString() : "No DOB"}</p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(user)}
                            disabled={isDeleting === user.id}
                            className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                          >
                            {isDeleting === user.id ? (
                              <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <GlassCard className="p-8 space-y-6 relative border-primary/20 shadow-2xl">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Edit User Details</h2>
                  <p className="text-sm text-muted-foreground">Updating records for {editingUser.fullName}</p>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase text-left block">Full Name</label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={editingUser.fullName}
                      onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase block">Department</label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={editingUser.department}
                      onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase block">Phone</label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase block">Date of Birth</label>
                    <input 
                      type="date"
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={editingUser.dob ? editingUser.dob.split('T')[0] : ''}
                      onChange={(e) => setEditingUser({...editingUser, dob: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase block">Roll Number</label>
                    <input 
                      className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={editingUser.rollNo || ''}
                      onChange={(e) => setEditingUser({...editingUser, rollNo: e.target.value})}
                      placeholder="DYD-24-XXX"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase block">Semester</label>
                    <select 
                      className="w-full h-[46px] bg-secondary/30 border border-white/10 rounded-xl px-4 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={editingUser.semester || ''}
                      onChange={(e) => setEditingUser({...editingUser, semester: Number(e.target.value)})}
                    >
                      <option value="">Select Semester</option>
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-2 pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setEditingUser(null)}
                      className="flex-1 py-3 rounded-xl bg-secondary/50 text-foreground font-medium hover:bg-secondary transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 space-y-6 relative border-destructive/20 shadow-2xl overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-3xl -mr-12 -mt-12" />
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Confirm Deletion</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Are you sure you want to remove <span className="text-foreground font-semibold px-1 rounded bg-white/5">{deleteConfirm.fullName}</span>? 
                      This action is permanent and all candidate data will be lost.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 relative z-10">
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 rounded-xl bg-secondary/50 text-foreground font-medium hover:bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      const id = deleteConfirm.id;
                      setDeleteConfirm(null);
                      await handleDelete(id);
                    }}
                    className="flex-1 py-3 rounded-xl bg-destructive text-white font-medium shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all"
                  >
                    Delete Forever
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;