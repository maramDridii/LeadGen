import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Twitter, 
  Zap, 
  Users, 
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Tweet Monitor", icon: Twitter, href: "/monitor" },
  { label: "Content Gen", icon: Sparkles, href: "/content" },
  { label: "Leads CRM", icon: Users, href: "/leads" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 glass-panel border-r border-white/5 z-50 flex flex-col transition-transform duration-300 md:translate-x-0 -translate-x-full">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display leading-none text-white">Twitter<span className="text-primary">X</span></h1>
            <span className="text-xs text-muted-foreground font-medium">Growth Engine</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group font-medium text-sm",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white hover:translate-x-1"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "animate-pulse" : "group-hover:text-primary")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 mb-4">
          <p className="text-xs text-indigo-200 font-medium mb-1">Current Plan</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Pro Growth</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20">Active</span>
          </div>
        </div>
        
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
