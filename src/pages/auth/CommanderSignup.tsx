import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, Eye, EyeOff, ArrowLeft, Mail, KeyRound, User as UserIcon, Hash, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import CyberBackground from '@/components/CyberBackground';

const passwordChecks = (pw: string) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /\d/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

export default function CommanderSignup() {
  const { signUpAsCommander } = useAuth();
  const navigate = useNavigate();
  const [commanderId, setCommanderId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checks = passwordChecks(password);
  const allValid = Object.values(checks).every(Boolean);
  const match = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!commanderId.trim()) {
      setError('Commander ID is required.');
      return;
    }
    if (commanderId.trim().toUpperCase() === 'CMD001') {
      setError('CMD001 is reserved. Choose a different Commander ID.');
      return;
    }
    if (!allValid) {
      setError('Password must meet all the requirements below.');
      return;
    }
    if (!match) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await signUpAsCommander(commanderId, fullName, email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/commander/dashboard');
    }
  };

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={`flex items-center gap-1.5 text-xs ${ok ? 'text-cyber-green' : 'text-ocean-200/50'}`}>
      {ok ? <Check size={12} /> : <X size={12} />} {label}
    </li>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-900">
      <CyberBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="glass-strong rounded-2xl p-8 border border-cyber-cyan/30 shadow-glow-cyan">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl cyber-btn">
                <ShieldCheck size={32} className="text-cyber-cyan" />
              </div>
              <span className="absolute inset-0 rounded-2xl animate-glow-pulse" />
            </div>
            <Logo size={32} showText={false} />
            <h1 className="mt-4 font-display text-2xl font-bold text-white">Commander Registration</h1>
            <p className="text-sm text-ocean-200/70 mt-1">Register a new commander account to access the command center.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Commander ID</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
                  <input
                    type="text"
                    value={commanderId}
                    onChange={(e) => setCommanderId(e.target.value)}
                    placeholder="CMD002"
                    required
                    className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-4 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                  />
                </div>
                <p className="mt-1 text-[10px] text-ocean-200/50">CMD001 is reserved. Pick a unique ID.</p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Johnson"
                    required
                    minLength={2}
                    className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-4 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@example.com"
                  required
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-4 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
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
              <ul className="mt-2 grid grid-cols-2 gap-1">
                <CheckItem ok={checks.length} label="8+ characters" />
                <CheckItem ok={checks.upper} label="Uppercase letter" />
                <CheckItem ok={checks.lower} label="Lowercase letter" />
                <CheckItem ok={checks.number} label="Number" />
                <CheckItem ok={checks.special} label="Special character" />
              </ul>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-10 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-200/60 hover:text-cyber-cyan"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && (
                <p className={`mt-1 text-xs ${match ? 'text-cyber-green' : 'text-cyber-red'}`}>
                  {match ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
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
              {loading ? 'Creating account...' : 'Register Commander'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/" className="flex items-center gap-1 text-ocean-200/70 hover:text-cyber-cyan transition">
              <ArrowLeft size={14} /> Back
            </Link>
            <Link to="/commander/login" className="text-cyber-cyan hover:underline">
              Already have an account?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
