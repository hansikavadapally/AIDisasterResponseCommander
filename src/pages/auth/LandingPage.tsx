import { motion } from 'framer-motion';
import { Bot, Shield, Radio, Activity, ArrowRight, Plane, AlertTriangle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import CyberBackground from '@/components/CyberBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-900 text-white">
      <CyberBackground />
      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <Logo size={44} />
        <div className="flex items-center gap-3">
          <Link
            to="/commander/login"
            className="cyber-btn rounded-xl px-4 py-2 text-sm font-semibold transition"
          >
            Commander Login
          </Link>
          <Link
            to="/client/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-cyber-green border border-cyber-green/40 hover:bg-cyber-green/10 transition"
          >
            Client Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 glass border border-cyber-cyan/30"
          >
            <Sparkles size={14} className="text-cyber-cyan" />
            <span className="text-xs uppercase tracking-[0.25em] text-cyber-cyan font-medium">AI-Powered Emergency Response</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight"
          >
            AI DISASTER RESPONSE &
            <br />
            <span className="text-cyber-cyan neon-text">MULTI-ROBOT COMMAND CENTER</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-ocean-200/80 max-w-3xl mx-auto"
          >
            Coordinate autonomous rescue robots and surveillance drones during earthquakes, floods, fires,
            and other disasters. Real-time mission tracking, AI-powered recommendations, and live emergency alerts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/client/signup"
              className="cyber-btn rounded-xl px-6 py-3 font-semibold flex items-center gap-2"
            >
              Get Started as Client <ArrowRight size={16} />
            </Link>
            <Link
              to="/commander/login"
              className="rounded-xl px-6 py-3 font-semibold text-cyber-green border border-cyber-green/40 hover:bg-cyber-green/10 transition"
            >
              Commander Access
            </Link>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: Bot, title: '30 Rescue Robots', desc: 'Autonomous ground units for search, rescue, and supply delivery', color: 'text-cyber-cyan' },
              { icon: Plane, title: '20 Surveillance Drones', desc: 'Aerial monitoring with live video and victim detection', color: 'text-cyber-blue' },
              { icon: AlertTriangle, title: 'Emergency Alerts', desc: 'Real-time disaster alerts with SOS indicators and sirens', color: 'text-cyber-red' },
              { icon: Activity, title: 'Live Mission Tracking', desc: 'Track every rescue from dispatch to completion', color: 'text-cyber-green' },
              { icon: Shield, title: 'Role-Based Access', desc: 'Commander and Client portals with secure auth', color: 'text-cyber-orange' },
              { icon: Radio, title: 'Real-time Sync', desc: 'All dashboards update instantly via Supabase Realtime', color: 'text-cyber-purple' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass rounded-2xl p-5 text-left border border-cyber-cyan/15 hover:border-cyber-cyan/40 transition">
                  <Icon size={28} className={f.color} />
                  <h3 className="mt-3 font-display font-bold text-white">{f.title}</h3>
                  <p className="text-sm text-ocean-200/70 mt-1">{f.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-5 text-center text-xs text-ocean-200/50 border-t border-cyber-cyan/10">
        Robo Web Sprint - AI Disaster Response Command Center
      </footer>
    </div>
  );
}
