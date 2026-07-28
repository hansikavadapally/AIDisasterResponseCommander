import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FilePlus, History, Crosshair, Bell, User, LogOut, Menu, X, Radio,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import NotificationPanel from '@/components/NotificationPanel';
import LiveClock from '@/components/LiveClock';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/supabase';

const navItems = [
  { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/client/submit', label: 'Submit Complaint', icon: FilePlus },
  { to: '/client/history', label: 'Complaint History', icon: History },
  { to: '/client/tracking', label: 'Rescue Tracking', icon: Crosshair },
  { to: '/client/notifications', label: 'Notifications', icon: Bell },
  { to: '/client/profile', label: 'Profile', icon: User },
];

export default function ClientLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => data && setNotifications((data as Notification[]).filter((n) => n.user_id === profile?.id || n.role === 'client')));

    const notifSub = supabase
      .channel('client-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as Notification;
        if (n.user_id === profile?.id || n.role === 'client') {
          setNotifications((prev) => [n, ...prev].slice(0, 50));
        }
      })
      .subscribe();

    return () => {
      notifSub.unsubscribe();
    };
  }, [profile?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unread.map((n) => n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-900">
      <header className="sticky top-0 z-30 glass-strong border-b border-cyber-cyan/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="lg:hidden rounded-lg p-2 text-cyber-cyan hover:bg-cyber-cyan/10"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo size={36} />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-ocean-200/80">
              <Radio size={14} className="text-cyber-green animate-pulse" />
              <span className="font-mono">LIVE</span>
              <LiveClock />
            </div>
            <NotificationPanel notifications={notifications} onMarkAllRead={markAllRead} onMarkRead={markRead} />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-cyber-red border border-cyber-red/30 hover:bg-cyber-red/10 transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:sticky top-[64px] z-20 h-[calc(100vh-64px)] w-64 glass-strong border-r border-cyber-cyan/20 transition-transform duration-300 overflow-y-auto`}
        >
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-glow-cyan'
                        : 'text-ocean-100 hover:bg-cyber-cyan/5 hover:text-cyber-cyan border border-transparent'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="m-3 mt-6 glass rounded-xl p-3 border border-cyber-cyan/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyber-green/15 text-cyber-green font-bold border border-cyber-green/40">
                {profile?.display_name?.charAt(0) ?? 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.display_name}</p>
                <p className="text-[10px] text-cyber-green uppercase tracking-wider">Client</p>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-10 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Welcome, <span className="text-cyber-green neon-text-green">{profile?.display_name ?? ''}</span>
            </h1>
            <p className="text-sm text-ocean-200/70 mt-1 max-w-3xl">
              Submit emergency requests, monitor your assigned rescue robot or drone, receive live rescue updates, and stay informed throughout the rescue operation.
            </p>
          </motion.div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
