import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import CyberBackground from '@/components/CyberBackground';

export default function CommanderLogin() {
  const { signInAsCommander } = useAuth();
  const navigate = useNavigate();
  const [commanderId, setCommanderId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signInAsCommander(commanderId, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/commander/dashboard');
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
        <div className="glass-strong rounded-2xl p-8 border border-cyber-cyan/30 shadow-glow-cyan">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl cyber-btn">
                <Shield size={32} className="text-cyber-cyan" />
              </div>
              <span className="absolute inset-0 rounded-2xl animate-glow-pulse" />
            </div>
            <Logo size={32} showText={false} />
            <h1 className="mt-4 font-display text-2xl font-bold text-white">Commander Login</h1>
            <p className="text-sm text-ocean-200/70 mt-1">Authorized personnel only. Enter your Commander credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Commander ID</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
                <input
                  type="text"
                  value={commanderId}
                  onChange={(e) => setCommanderId(e.target.value)}
                  placeholder="CMD001"
                  required
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-4 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Password</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-10 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-200/60 hover:text-cyber-cyan"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              className="w-full cyber-btn rounded-xl py-3 font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/" className="flex items-center gap-1 text-ocean-200/70 hover:text-cyber-cyan transition">
              <ArrowLeft size={14} /> Back
            </Link>
            <Link to="/commander/signup" className="text-cyber-cyan hover:underline">
              Register as Commander
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
