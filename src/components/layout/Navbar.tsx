import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  LogOut, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const profile = await apiService.getUser(token);
          setUser(profile);
          setIsAdmin(profile.role === "admin");
        } catch (error) {
          console.error("Navbar profile fetch error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const navLinks = [
    { 
      name: "Dashboard", 
      path: isAdmin ? "/admin/dashboard" : "/dashboard", 
      icon: LayoutDashboard 
    },
    ...(isAdmin ? [{ name: "User Management", path: "/admin/users", icon: Users }] : []),
    { name: "My Profile", path: "/profile", icon: UserCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-2 group p-2 rounded-2xl glass border border-white/5 shadow-antigravity">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-300">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <div className="hidden sm:block pr-2">
            <p className="text-sm font-bold text-foreground leading-none">University</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">of Jammu</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl glass border border-white/5 shadow-antigravity">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 gradient-primary rounded-xl -z-10 shadow-lg shadow-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                {link.name}
              </Link>
            );
          })}
          
          <div className="w-px h-6 bg-white/10 mx-2" />

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl glass border border-white/5 text-foreground pointer-events-auto shadow-antigravity"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 md:hidden pointer-events-auto"
          >
            <div className="glass border border-white/5 rounded-3xl p-4 shadow-2xl flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{link.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                );
              })}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 rounded-2xl text-destructive hover:bg-destructive/5 transition-all text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
