import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import scholarshipBg from "@/assets/scholarship-bg.png";
import walletBg from "@/assets/wallet-bg.png";
import lewteBg from "@/assets/lewte-bg.png";
import essayBg from "@/assets/essay-bg.png";
import testprepBg from "@/assets/testprep-bg.png";
import schoolBg from "@/assets/school-bg.png";
import financialBg from "@/assets/financial-bg.png";
import {
  GraduationCap,
  WalletIcon,
  PencilIcon,
  Calculator,
  School,
  ShieldCheck,
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  Lock,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { useStudentVerification } from "@/hooks/useStudentVerification";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  cta: string;
  description: string;
  path: string;
  accent?: string;
  locked?: boolean;
  lockMessage?: string;
  span?: string;
  bgImage?: string;
}

function DashboardCard({
  icon,
  title,
  cta,
  description,
  path,
  locked,
  lockMessage,
  span = "",
  bgImage,
}: DashboardCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={item}
      className={`group relative overflow-hidden rounded-2xl shadow-card-modern hover:shadow-glow transition-all duration-300 cursor-pointer ${bgImage ? "min-h-[200px] border-0" : "bg-card border border-border"} ${span}`}
      onClick={() => !locked && navigate(path)}
      style={bgImage ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >

      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-md rounded-2xl">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="font-semibold text-foreground text-center px-4">
            {lockMessage}
          </p>
          <Button
            size="sm"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(path);
            }}
          >
            Unlock Now
          </Button>
        </div>
      )}

      <div className={`relative z-[1] p-5 sm:p-6 flex flex-col h-full ${locked ? "blur-sm" : ""}`}>
        <div className="flex items-start justify-between mb-4">
          <GradientIcon icon={icon} className={`h-8 w-8 sm:h-10 sm:w-10 ${bgImage ? "text-white" : ""}`} />
          <ArrowRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ${bgImage ? "text-white" : "text-muted-foreground"}`} />
        </div>
        <h3 className={`text-base sm:text-lg font-bold mb-1 ${bgImage ? "text-white drop-shadow-md" : "text-foreground"}`}>
          {title}
        </h3>
        <p className={`text-xs sm:text-sm mb-4 flex-1 ${bgImage ? "text-white/90 drop-shadow-sm" : "text-muted-foreground"}`}>
          {description}
        </p>
        <div className={`font-semibold text-sm flex items-center gap-1 ${bgImage ? "text-white drop-shadow-md" : "bg-gradient-primary bg-clip-text text-transparent"}`}>
          <Sparkles className={`h-3.5 w-3.5 ${bgImage ? "text-white" : "text-primary"}`} />
          {cta}
        </div>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const { isVerified } = useStudentVerification();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) {
          setFirstName(data.full_name.split(" ")[0]);
        }
      }
    };
    fetchName();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
          {firstName ? `Welcome back, ${firstName}!` : "Welcome back!"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Your all-in-one hub for scholarships, savings, and success.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        {/* Scholarships - featured */}
        <DashboardCard
          icon={GraduationCap}
          title="Scholarships"
          cta="New scholarships are waiting!"
          description="Swipe through scholarships matched to your profile. Save your favorites and apply fast."
          path="/scholarships"
          span="sm:col-span-2 lg:col-span-1"
          bgImage={scholarshipBg}
        />

        {/* Wallet */}
        <DashboardCard
          icon={WalletIcon}
          title="Scholarship Wallet"
          cta="You could be saving $$$"
          description="Track your saved scholarships, deadlines, and application statuses in one place."
          path="/wallet"
          bgImage={walletBg}
        />

        {/* Lewte - conditional */}
        <DashboardCard
          icon={isVerified ? Tag : ShieldCheck}
          title="Lewte"
          cta={isVerified ? "Exclusive deals available now" : "Unlock exclusive deals"}
          description={
            isVerified
              ? "Browse coupons, take surveys, and earn reward points for student perks."
              : "Verify your student status to unlock exclusive coupons, surveys, and rewards."
          }
          path="/lewte"
          locked={!isVerified}
          lockMessage="🔒 Unlock exclusive student deals & rewards"
          bgImage={lewteBg}
        />

        {/* Essay Assistant */}
        <DashboardCard
          icon={PencilIcon}
          title="Essay Assistant"
          cta="Craft a winning essay"
          description="AI-powered tools to help you brainstorm, outline, and polish your scholarship essays."
          path="/essay-assistant"
          bgImage={essayBg}
        />

        {/* Test Prep */}
        <DashboardCard
          icon={Calculator}
          title="Test Prep"
          cta="Boost your scores"
          description="Practice questions, study plans, and strategies for the SAT and ACT."
          path="/test-prep"
          bgImage={testprepBg}
        />

        {/* School Matchmaker */}
        <DashboardCard
          icon={School}
          title="School Matchmaker"
          cta="Find your perfect school"
          description="Discover colleges that match your interests, budget, and career goals."
          path="/school-matchmaker"
          bgImage={schoolBg}
        />

        {/* Financial Education */}
        <DashboardCard
          icon={BookOpen}
          title="Financial Education"
          cta="Learn to manage college costs"
          description="Understand FAFSA, student loans, budgeting, and financial planning for college."
          path="/financial-education"
        />

        {/* First-Gen Resources */}
        <DashboardCard
          icon={Users}
          title="First-Gen Resources"
          cta="You're not alone"
          description="Guides, checklists, and community support designed for first-generation students."
          path="/first-gen-resources"
          bgImage={financialBg}
        />
      </motion.div>
    </div>
  );
}
