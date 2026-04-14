import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { apiService } from "@/services/api";
import { Users, School, Landmark, TrendingUp } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

const COLORS = ["#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#10B981"];

interface AnalyticsData {
  totalCandidates: number;
  schoolCount: Record<string, number>;
  departmentCount: Record<string, number>;
  interestCount: Record<string, number>;
  specializationCount: Record<string, number>;
}

const AdminDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const token = await user.getIdToken();
      const result = await apiService.getAnalytics(token);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to initialize
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAnalytics();
      }
    });
    return () => unsubscribe();
  }, []);

  const interestData = data ? Object.entries(data.interestCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value })) : [];

  const specData = data ? Object.entries(data.specializationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value })) : [];

  const stats = [
    { label: "Total Candidates", value: data?.totalCandidates || 0, icon: Users, color: "gradient-primary" },
    { label: "Top Interest", value: interestData[0]?.name || "N/A", icon: TrendingUp, color: "bg-accent" },
    { label: "Specializations", value: specData.length, icon: Landmark, color: "bg-secondary" },
    { label: "Enrollment Year", value: "2024", icon: School, color: "gradient-primary" },
  ];

  return (
    <div className="relative min-h-screen px-4 py-12 pt-24 md:pt-28">
      <CosmicBackground />
      <Navbar />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Analytics 👑</h1>
            <p className="text-muted-foreground">Real-time overview of the University portal</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="flex items-center gap-4 p-6">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shrink-0`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <GlassCard className="p-8 h-[450px] flex flex-col">
              <h3 className="text-lg font-semibold mb-6">Top Student Interests</h3>
              <div className="flex-1 w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interestData} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={100} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "12px", color: "#fff" }}
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {interestData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <GlassCard className="p-8 h-[450px] flex flex-col">
              <h3 className="text-lg font-semibold mb-6">Specialization Distribution</h3>
              <div className="flex-1 w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={specData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={10}
                        dataKey="value"
                      >
                        {specData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "12px", color: "#fff" }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;