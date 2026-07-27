import { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Eye, EyeOff, ArrowLeft, Mail, KeyRound, Phone, UserPlus, ShieldCheck, Check, X } from 'lucide-react';
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

export default function ClientSignup() {
  const { signUpAsClient } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    if (!allValid) {
      setError('Password must meet all the requirements below.');
      return;
    }
    if (!match) {
      setError('Passwords do not match.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }
    setLoading(true);
    const { error } = await signUpAsClient(fullName, email, phone, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/client/dashboard');
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
        <div className="glass-strong rounded-2xl p-8 border border-cyber-green/30 shadow-glow-green">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-green/15 border border-cyber-green/40">
                <UserPlus size={32} className="text-cyber-green" />
              </div>
              <span className="absolute inset-0 rounded-2xl animate-glow-pulse" />
            </div>
            <Logo size={32} showText={false} />
            <h1 className="mt-4 font-display text-2xl font-bold text-white">Client Registration</h1>
            <p className="text-sm text-ocean-200/70 mt-1">Create your account to submit emergency requests.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Full Name</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  minLength={2}
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 pl-10 pr-4 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    required
                    className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 pl-10 pr-4 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition"
                  />
                </div>
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
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 pl-10 pr-10 py-3 text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-200/60 hover:text-cyber-green"
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
              className="w-full rounded-xl py-3 font-bold uppercase tracking-wider bg-cyber-green/15 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/25 hover:shadow-glow-green disabled:opacity-50 transition"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/" className="flex items-center gap-1 text-ocean-200/70 hover:text-cyber-green transition">
              <ArrowLeft size={14} /> Back
            </Link>
            <Link to="/client/login" className="text-cyber-cyan hover:underline">
              Already have an account?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
