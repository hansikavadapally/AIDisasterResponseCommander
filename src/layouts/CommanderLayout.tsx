import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Bot, Plane, FileText, Crosshair, Map, BarChart3, Sparkles,
  Bell, Settings, LogOut, Menu, X, Clock, Radio,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import CommanderNotificationDropdown from '@/components/CommanderNotificationDropdown';
import EmergencyAlertSystem from '@/components/EmergencyAlertSystem';
import LiveClock from '@/components/LiveClock';
import { supabase } from '@/lib/supabase';
import type { Notification, Alert } from '@/lib/supabase';

const navItems = [
  { to: '/commander/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/commander/fleet', label: 'Fleet Management', icon: Bot },
  { to: '/commander/requests', label: 'Client Requests', icon: FileText },
  { to: '/commander/missions', label: 'Mission Center', icon: Crosshair },
  { to: '/commander/map', label: 'Disaster Map', icon: Map },
  { to: '/commander/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/commander/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/commander/notifications', label: 'Notifications', icon: Bell },
  { to: '/commander/settings', label: 'Settings', icon: Settings },
];

export default function CommanderLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Load notifications for this commander only
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile?.id ?? '')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => data && setNotifications(data as Notification[]));

    supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25)
      .then(({ data }) => data && setAlerts(data as Alert[]));

    const notifSub = supabase
      .channel('commander-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const newRow = payload.new as Notification;
          if (newRow.user_id === profile?.id) {
            setNotifications((prev) => [newRow, ...prev].slice(0, 50));
          }
        }
      })
      .subscribe();

    const alertSub = supabase
      .channel('commander-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          setAlerts((prev) => [payload.new as Alert, ...prev]);
        }
      })
      .subscribe();

    return () => {
      notifSub.unsubscribe();
      alertSub.unsubscribe();
    };
  }, []);

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
      <EmergencyAlertSystem alerts={alerts} onDismiss={() => {}} />

      {/* Top bar */}
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
            <CommanderNotificationDropdown notifications={notifications} onMarkAllRead={markAllRead} onMarkRead={markRead} />
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
        {/* Sidebar */}
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
          {/* Commander profile card */}
          <div className="m-3 mt-6 glass rounded-xl p-3 border border-cyber-cyan/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyber-cyan/15 text-cyber-cyan font-bold border border-cyber-cyan/40">
                {profile?.display_name?.charAt(0) ?? 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.display_name}</p>
                <p className="text-[10px] text-cyber-cyan uppercase tracking-wider">Commander • CMD001</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-10 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          {/* Welcome heading */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Welcome Commander <span className="text-cyber-cyan neon-text">{profile?.display_name ?? ''}</span>
            </h1>
            <p className="text-sm text-ocean-200/70 mt-1 max-w-3xl">
              Monitor disasters, coordinate rescue robots and drones, assign missions, and oversee emergency response operations from the central AI command center.
            </p>
          </motion.div>

          <Outlet />
        </main>
      </div>

    </div>
  );
}
