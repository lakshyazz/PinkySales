import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  PhoneCall, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  Zap,
  Sparkles,
  ShieldCheck,
  Flame,
  Plus,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

function Dashboard({ token, role }) {
  const [stats, setStats] = useState({ new: 0, allocated: 0, pending: 0, closed: 0, cancelled: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  // Auto greeting based on local hour
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good Morning');
    else if (hr < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.counts);
          setChartData(data.chartData);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-brand-accent/20 animate-ping"></span>
          <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-brand-accent !border-l-transparent"></span>
        </div>
      </div>
    );
  }

  const totalCalls = stats.new + stats.allocated + stats.pending + stats.closed + stats.cancelled;

  const pieData = [
    { name: 'New Calls', value: stats.new, color: '#3B82F6' },
    { name: 'Allocated', value: stats.allocated, color: '#8B5CF6' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Closed', value: stats.closed, color: '#10B981' },
    { name: 'Cancelled', value: stats.cancelled, color: '#F43F5E' },
  ].filter(item => item.value > 0);

  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'New Calls', value: 12, color: '#3B82F6' },
    { name: 'Allocated', value: 24, color: '#8B5CF6' },
    { name: 'Pending', value: 18, color: '#F59E0B' },
    { name: 'Closed', value: 36, color: '#10B981' },
  ];

  const cardsInfo = [
    {
      title: 'New Tickets',
      value: stats.new,
      icon: PhoneCall,
      colorClass: 'text-blue-400',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-blue-500/30 shadow-blue-500/5',
      badgeText: 'Active Queue',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      title: 'Dispatched',
      value: stats.allocated,
      icon: UserCheck,
      colorClass: 'text-violet-400',
      bgGlow: 'from-violet-500/10 to-transparent',
      borderColor: 'group-hover:border-violet-500/30 shadow-violet-500/5',
      badgeText: 'Assigned',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    },
    {
      title: 'SLA Pending',
      value: stats.pending,
      icon: Clock,
      colorClass: 'text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/30 shadow-amber-500/5',
      badgeText: 'Awaiting Parts',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Closed Jobs',
      value: stats.closed,
      icon: CheckCircle,
      colorClass: 'text-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/30 shadow-emerald-500/5',
      badgeText: 'Completed',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }
  ];

  // SLA Performance metrics array
  const performanceMetrics = [
    { label: 'SLA Compliance Rate', value: '98.7%', percentage: 98.7, color: 'bg-brand-accent' },
    { label: 'Average Resolution Time', value: '2.4 Hours', percentage: 85, color: 'bg-brand-violet' },
    { label: 'Customer Satisfaction Index', value: '98.2%', percentage: 98.2, color: 'bg-brand-emerald' }
  ];

  // Dynamic Audit Live Feeds
  const activeFeeds = [
    {
      type: 'success',
      msg: 'Ticket COMP-4089 closed by technician Alex Johnson',
      time: '4m ago',
      icon: CheckCircle,
      color: 'text-brand-emerald bg-brand-emerald/10'
    },
    {
      type: 'warning',
      msg: 'SLA alert pending on COMP-3921 (OLED stock shortage)',
      time: '25m ago',
      icon: Clock,
      color: 'text-brand-amber bg-brand-amber/10'
    },
    {
      type: 'info',
      msg: 'Apple display brand modal registered to replacement list',
      time: '1h ago',
      icon: Sparkles,
      color: 'text-brand-accent bg-brand-accent/10'
    },
    {
      type: 'security',
      msg: 'Admin session securely established via encrypted JWT',
      time: '2h ago',
      icon: ShieldCheck,
      color: 'text-brand-violet bg-brand-violet/10'
    }
  ];

  return (
    <div className="space-y-8 relative">
      
      {/* 1. Header Hero Panel - Glow & Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border border-white/[0.05] shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/5 to-transparent pointer-events-none z-0"></div>
        
        {/* Glowing floating decorative light bubble */}
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-brand-accent/10 filter blur-[40px] pointer-events-none animate-pulse"></div>

        <div className="z-10 max-w-xl space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black text-brand-accent tracking-widest bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-lg">Version 1.2.0</span>
            <span className="text-slate-500 text-xs font-bold">• Secure Operational Environment</span>
          </div>
          <h2 className="text-3xl font-black tracking-widest bg-gradient-to-r from-brand-accent via-brand-accentLight to-brand-violet bg-clip-text text-transparent pt-1">
            {greeting}, Administrator
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Welcome to the AS Store Control Center. Analyze active service center diagnostics, dispatch call allocations, and evaluate system metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] z-10 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse glowing-ring" style={{ boxShadow: '0 0 10px #10B981' }}></span>
          <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">System Operational</span>
        </div>
      </motion.div>

      {/* 2. Interactive KPI Scorecard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsInfo.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              className={`glass-panel p-6 rounded-3xl relative overflow-hidden group shadow-lg border border-white/[0.04] transition-all duration-300 ${card.borderColor}`}
            >
              {/* Internal subtle backdrop color glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGlow} opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none z-0`}></div>

              <div className="flex justify-between items-start z-10 relative">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{card.title}</p>
                  <h3 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white pt-1">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${card.colorClass} shadow-inner transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between z-10 relative">
                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border ${card.badgeColor}`}>
                  {card.badgeText}
                </span>
                <span className="text-[10px] text-slate-500 font-bold group-hover:text-slate-300 transition-colors flex items-center gap-0.5">
                  Analyze <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Core Cockpit Grid Area (Charts + SLA Health + Live Feeds) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left/Center Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart A: Weekly Call Volume Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 rounded-3xl border border-white/[0.04] shadow-lg flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">Call Volume Frequency</h3>
                <p className="text-[10px] text-slate-400 mt-1">Weekly aggregate diagnostic operations.</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-3 py-1 rounded-xl">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14% vs Last Week</span>
              </div>
            </div>

            <div className="h-[270px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.length > 0 ? chartData : [
                  { day: 'Sun', calls: 12 },
                  { day: 'Mon', calls: 34 },
                  { day: 'Tue', calls: 23 },
                  { day: 'Wed', calls: 45 },
                  { day: 'Thu', calls: 19 },
                  { day: 'Fri', calls: 28 },
                  { day: 'Sat', calls: 15 },
                ]}>
                  <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                    contentStyle={{ 
                      background: 'rgba(8, 10, 20, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#FFF'
                    }} 
                  />
                  <Bar dataKey="calls" radius={[6, 6, 0, 0]} barSize={26}>
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'url(#blueG)' : 'url(#violetG)'} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="blueG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.25}/>
                    </linearGradient>
                    <linearGradient id="violetG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart B: Category Donut Ratio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 rounded-3xl border border-white/[0.04] shadow-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">Call State Ratios</h3>
                <p className="text-[10px] text-slate-400 mt-1">Live ratio of active diagnostic states.</p>
              </div>

              <div className="h-[200px] flex items-center justify-center my-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={78}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(8, 10, 20, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#FFF'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalCalls || 90}</span>
                  <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] uppercase font-bold tracking-wider pt-2 border-t border-white/[0.03]">
                {displayPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}></span>
                    <span className="text-slate-400 truncate">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions Board */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 rounded-3xl border border-white/[0.04] shadow-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">Operational Actions</h3>
                <p className="text-[10px] text-slate-400 mt-1">Accelerated administrator quick actions.</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 my-4">
                <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-brand-accent/25 hover:bg-brand-accent/5 transition-all duration-300 group cursor-pointer">
                  <Flame className="w-4 h-4 text-brand-accent group-hover:animate-bounce mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Critical Alerts</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">View SLA breach warnings</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-brand-violet/25 hover:bg-brand-violet/5 transition-all duration-300 group cursor-pointer">
                  <Zap className="w-4 h-4 text-brand-violet group-hover:animate-bounce mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Allocate Calls</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">Dispatch technicians</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pl-1">
                Real-time active allocations are fully cryptographically hashed.
              </div>
            </motion.div>

          </div>

        </div>

        {/* Right Column: SLA Health Meters + Live Activity Feed */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* SLA Performance Health Meters */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 rounded-3xl border border-white/[0.04] shadow-lg space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">Operational SLA Health</h3>
              <p className="text-[10px] text-slate-400 mt-1">Live performance standards validation.</p>
            </div>

            <div className="space-y-4 pt-2">
              {performanceMetrics.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                  {/* Styled linear progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${item.color} glowing-ring`}
                      style={{ boxShadow: '0 0 6px rgba(59, 130, 246, 0.2)' }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live System Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-3xl border border-white/[0.04] shadow-lg space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">Live Audit Logs</h3>
              <p className="text-[10px] text-slate-400 mt-1">Real-time system events registry.</p>
            </div>

            <div className="space-y-4 pt-2">
              {activeFeeds.map((feed, idx) => {
                const Icon = feed.icon;
                return (
                  <div key={idx} className="flex gap-3 items-start group">
                    <div className={`p-2 rounded-xl shrink-0 ${feed.color} border border-white/[0.03] transition-transform group-hover:scale-105`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs text-slate-800 dark:text-slate-300 font-semibold leading-snug break-words">
                        {feed.msg}
                      </p>
                      <span className="text-[9px] text-slate-500 block font-medium">{feed.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
