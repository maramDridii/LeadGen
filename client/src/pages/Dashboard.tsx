import { useDashboardStats } from "@/hooks/use-dashboard";
import { StatsCard } from "@/components/StatsCard";
import { PageHeader } from "@/components/PageHeader";
import { Users, MessageSquare, Zap, Target, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";

const CHART_DATA = [
  { name: 'Mon', leads: 4 },
  { name: 'Tue', leads: 7 },
  { name: 'Wed', leads: 5 },
  { name: 'Thu', leads: 9 },
  { name: 'Fri', leads: 12 },
  { name: 'Sat', leads: 8 },
  { name: 'Sun', leads: 10 },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background text-white pl-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        <PageHeader 
          title="Overview" 
          description="Your growth analytics and performance metrics at a glance."
        />

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <StatsCard 
              title="Total Leads" 
              value={stats?.totalLeads || 0} 
              icon={<Users className="w-6 h-6" />}
              color="primary"
              trend="+12%"
              trendUp={true}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard 
              title="Contacted" 
              value={stats?.contacted || 0} 
              icon={<MessageSquare className="w-6 h-6" />}
              color="purple"
              trend="+5%"
              trendUp={true}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard 
              title="Replies" 
              value={stats?.replies || 0} 
              icon={<Zap className="w-6 h-6" />}
              color="emerald"
              trend="High engagement"
              trendUp={true}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard 
              title="Conversions" 
              value={stats?.conversions || 0} 
              icon={<Target className="w-6 h-6" />}
              color="amber"
              trend="+2%"
              trendUp={true}
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-display">Lead Acquisition</h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">New Leads</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                    {CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(210, 100%, 52%)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold font-display mb-4">Performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="text-white font-bold">{stats?.ctrAverage || 0}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full" 
                      style={{ width: `${stats?.ctrAverage || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Reply Volume</span>
                    <span className="text-white font-bold">{stats?.replies || 0}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" 
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-indigo-100">AI Insight</span>
              </div>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Your response rate is trending up 15% this week. Focus on niche-specific content to maximize conversion.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
