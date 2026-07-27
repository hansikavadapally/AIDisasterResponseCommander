import { useState } from 'react';
import { motion } from 'framer-motion';
import { FilePlus, Send, MapPin, Upload, AlertTriangle, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const emergencyTypes = ['Earthquake', 'Flood', 'Fire', 'Cyclone', 'Landslide', 'Building Collapse', 'Gas Leakage', 'Tsunami', 'Medical Emergency', 'Other'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

export default function SubmitComplaint() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emergencyType, setEmergencyType] = useState('Earthquake');
  const [priority, setPriority] = useState('High');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = () => {
    // Mock live location
    const baseLat = 19.076;
    const baseLng = 72.8777;
    const lat = baseLat + (Math.random() - 0.5) * 0.2;
    const lng = baseLng + (Math.random() - 0.5) * 0.2;
    setLatitude(Math.round(lat * 10000) / 10000);
    setLongitude(Math.round(lng * 10000) / 10000);
    setLocation(`Detected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user || !profile) return;
    if (!title.trim() || !description.trim()) {
      setError('Please fill in title and description.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('complaints').insert({
      client_id: user.id,
      client_name: profile.display_name,
      title,
      description,
      emergency_type: emergencyType,
      priority,
      location: location || null,
      latitude,
      longitude,
      image_url: imagePreview,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Notify commander
    await supabase.from('notifications').insert({
      role: 'commander',
      type: 'complaint',
      title: 'New Complaint Received',
      message: `${profile.display_name} submitted a ${emergencyType} emergency: ${title}`,
    });
    // Activity log
    await supabase.from('activity_logs').insert({
      type: 'complaint',
      message: `${profile.display_name} submitted a ${emergencyType} emergency request: ${title}`,
      severity: priority === 'Critical' ? 'critical' : 'info',
    });
    setSuccess(true);
    setTitle('');
    setDescription('');
    setLocation('');
    setLatitude(null);
    setLongitude(null);
    setImagePreview(null);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h3 className="font-display font-bold text-white mb-1 flex items-center gap-2"><FilePlus size={20} className="text-cyber-green" /> Submit Emergency Request</h3>
        <p className="text-sm text-ocean-200/70 mb-5">Describe your emergency and a rescue team will be dispatched to your location.</p>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-cyber-green/10 border border-cyber-green/40 px-4 py-3 text-sm text-cyber-green flex items-center gap-2"
          >
            <Check size={16} /> Complaint submitted successfully. The commander has been notified.
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your emergency"
              required
              className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 px-4 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the situation in detail..."
              required
              className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 px-4 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Emergency Type</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 px-4 py-2.5 text-sm text-white"
              >
                {emergencyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 px-4 py-2.5 text-sm text-white"
              >
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter address or detect location"
                className="flex-1 rounded-xl bg-surface-700/60 border border-cyber-green/20 px-4 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-green/60 transition"
              />
              <button
                type="button"
                onClick={detectLocation}
                className="rounded-xl px-3 py-2.5 text-sm text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/10 flex items-center gap-1.5 transition"
              >
                <MapPin size={16} /> Detect
              </button>
            </div>
            {latitude && longitude && (
              <p className="mt-1 text-xs text-cyber-cyan font-mono">Lat: {latitude}, Lng: {longitude}</p>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Upload Image (optional)</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer rounded-xl px-4 py-2.5 text-sm text-cyber-blue border border-cyber-blue/30 hover:bg-cyber-blue/10 flex items-center gap-2 transition">
                <Upload size={16} /> Choose File
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-cyber-blue/30" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute -top-1 -right-1 rounded-full bg-cyber-red text-white p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-cyber-red/10 border border-cyber-red/40 px-3 py-2 text-sm text-cyber-red flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-3 font-bold uppercase tracking-wider bg-cyber-green/15 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/25 hover:shadow-glow-green disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
