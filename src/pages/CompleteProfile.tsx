import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { CandidateProfileForm } from "@/components/auth/CandidateProfileForm";
import { AdminProfileForm } from "@/components/auth/AdminProfileForm";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { GlassCard } from "@/components/ui/GlassCard";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const isAdmin = user.email?.endsWith("@jammuuniversity.ac.in");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <CosmicBackground />
      <div className="w-full max-w-2xl relative z-10">
        <GlassCard className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">Please provide your details to finish setting up your account.</p>
          </div>
          {isAdmin ? <AdminProfileForm /> : <CandidateProfileForm />}
        </GlassCard>
      </div>
    </div>
  );
};

export default CompleteProfile;
