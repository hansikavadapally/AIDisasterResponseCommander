import { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Eye, EyeOff, ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import CyberBackground from '@/components/CyberBackground';

export default function ClientLogin() {
  const { signInAsClient } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signInAsClient(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-900">
      <CyberBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 border border-cyber-green/30 shadow-glow-green">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-green/15 border border-cyber-green/40">
                <ShieldCheck size={32} className="text-cyber-green" />
              </div>
              <span className="absolute inset-0 rounded-2xl animate-glow-pulse" />
            </div>
            <Logo size={32} showText={false} />
            <h1 className="mt-4 font-display text-2xl font-bold text-white">Client Login</h1>
            <p className="text-sm text-ocean-200/70 mt-1">Access your rescue dashboard and track your requests.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 pl-10 pr-4 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 pl-10 pr-10 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-200/60 hover:text-cyber-green"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ocean-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-cyber-green/40 bg-surface-700 text-cyber-green focus:ring-cyber-green/40"
                />
                Remember me
              </label>
              <button type="button" className="text-cyber-green hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-cyber-red/10 border border-cyber-red/40 px-3 py-2 text-sm text-cyber-red"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-bold uppercase tracking-wider bg-cyber-green/15 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/25 hover:shadow-glow-green disabled:opacity-50 transition"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-cyber-green/15">
            <div className="rounded-lg bg-cyber-green/5 border border-cyber-green/20 p-3 text-xs text-ocean-200/70">
              <p className="font-semibold text-cyber-green mb-1">Demo Client Account</p>
              <p className="font-mono">Email: client1@roboweb.ai</p>
              <p className="font-mono">Password: Client@123</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/" className="flex items-center gap-1 text-ocean-200/70 hover:text-cyber-green transition">
              <ArrowLeft size={14} /> Back
            </Link>
            <Link to="/client/signup" className="text-cyber-cyan hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
