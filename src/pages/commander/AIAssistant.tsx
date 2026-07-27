import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, AlertTriangle, Clock, Plane, Target, ShieldAlert, Star } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';

type AIResult = {
  bestRobot: string;
  robotId: string;
  estimatedTime: string;
  priority: string;
  strategy: string;
  risk: string;
  droneRec: string;
};

export default function AIAssistant() {
  const { robots, drones, complaints, missions } = useCommanderData();
  const [disasterZone, setDisasterZone] = useState('');
  const [victimCount, setVictimCount] = useState('');
  const [severity, setSeverity] = useState('High');
  const [weather, setWeather] = useState('Clear');
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRecommendation = () => {
    setLoading(true);
    // Simulate AI computation
    setTimeout(() => {
      const available = robots.filter((r) => r.status === 'Available');
      const best = available.sort((a, b) => b.rescue_success_rate - a.rescue_success_rate)[0] ?? robots[0];
      const bestDrone = drones.filter((d) => d.status === 'Available').sort((a, b) => b.detection_accuracy - a.detection_accuracy)[0];
      const estTime = Math.floor(Math.random() * 30) + 10;
      const sev = severity as 'Low' | 'Medium' | 'High' | 'Critical';
      const strategies: Record<string, string> = {
        Low: 'Deploy single rescue robot for reconnaissance and initial victim assessment.',
        Medium: 'Deploy rescue robot with aerial drone support for situational awareness.',
        High: 'Deploy two rescue robots with drone surveillance. Establish perimeter and triage zone.',
        Critical: 'Deploy maximum resources: 3+ rescue robots, 2+ drones, set up field hospital. Initiate mass casualty protocol.',
      };
      const risks: Record<string, string> = {
        Low: 'Low risk - minimal structural damage expected.',
        Medium: 'Moderate risk - unstable terrain, maintain communication relay.',
        High: 'High risk - structural collapse likely. Use heavy rescue bots first.',
        Critical: 'Critical risk - extreme danger. Full PPE required. Monitor for secondary disasters.',
      };
      setResult({
        bestRobot: best?.robot_name ?? 'N/A',
        robotId: best?.robot_id ?? 'N/A',
        estimatedTime: `${estTime} minutes`,
        priority: sev,
        strategy: strategies[sev],
        risk: risks[sev],
        droneRec: bestDrone ? `${bestDrone.drone_name} (${bestDrone.drone_id})` : 'No drones available',
      });
      setLoading(false);
    }, 1200);
  };

  const rescueSummary = {
    totalMissions: missions.length,
    completed: missions.filter((m) => m.status === 'Completed').length,
    active: missions.filter((m) => m.status !== 'Completed' && m.status !== 'Failed').length,
    successRate: missions.length > 0 ? Math.round((missions.filter((m) => m.status === 'Completed').length / missions.length) * 100) : 0,
    victimsAssisted: missions.filter((m) => m.status === 'Completed').length * 3,
  };

  return (
    <div className="space-y-4">
      {/* Rescue summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryBox label="Total Missions" value={rescueSummary.totalMissions} color="text-cyber-cyan" />
        <SummaryBox label="Completed" value={rescueSummary.completed} color="text-cyber-green" />
        <SummaryBox label="Active" value={rescueSummary.active} color="text-cyber-blue" />
        <SummaryBox label="Success Rate" value={`${rescueSummary.successRate}%`} color="text-cyber-yellow" />
        <SummaryBox label="Victims Assisted" value={rescueSummary.victimsAssisted} color="text-cyber-orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-cyber-cyan" /> Mission Parameters
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Disaster Zone</label>
              <input
                type="text"
                value={disasterZone}
                onChange={(e) => setDisasterZone(e.target.value)}
                placeholder="e.g., Sector A - Downtown"
                className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Victim Count</label>
                <input
                  type="number"
                  value={victimCount}
                  onChange={(e) => setVictimCount(e.target.value)}
                  placeholder="e.g., 25"
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white"
                >
                  <option value="Clear">Clear</option>
                  <option value="Rain">Rain</option>
                  <option value="Storm">Storm</option>
                  <option value="Fog">Fog</option>
                  <option value="High Winds">High Winds</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Available Robots</label>
                <input
                  type="text"
                  value={`${robots.filter((r) => r.status === 'Available').length} ready`}
                  readOnly
                  className="w-full rounded-xl bg-surface-700/40 border border-cyber-green/20 px-3 py-2.5 text-sm text-cyber-green"
                />
              </div>
            </div>
            <button
              onClick={generateRecommendation}
              disabled={loading || !disasterZone}
              className="w-full cyber-btn rounded-xl py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Bot size={18} className="animate-pulse" /> AI Analyzing...
                </>
              ) : (
                <>
                  <Send size={16} /> Generate Recommendation
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Result panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Bot size={18} className="text-cyber-green" /> AI Recommendation
          </h3>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-72 text-center"
              >
                <Sparkles size={48} className="text-cyber-cyan/30 mb-3" />
                <p className="text-sm text-ocean-200/60">Enter mission parameters and generate an AI-powered rescue recommendation.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="glass rounded-xl p-4 border border-cyber-cyan/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={18} className="text-cyber-cyan" />
                    <span className="text-xs uppercase tracking-wider text-ocean-200/70">Best Robot</span>
                  </div>
                  <p className="font-display text-lg font-bold text-cyber-cyan">{result.bestRobot}</p>
                  <p className="text-xs text-ocean-200/60 font-mono">{result.robotId}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ResultBox icon={<Clock size={16} />} label="Estimated Time" value={result.estimatedTime} color="text-cyber-blue" />
                  <ResultBox icon={<Target size={16} />} label="Priority" value={result.priority} color="text-cyber-orange" />
                </div>
                <ResultBox icon={<Plane size={16} />} label="Recommended Drone" value={result.droneRec} color="text-cyber-purple" />
                <div className="glass rounded-xl p-3 border border-cyber-green/20">
                  <p className="text-xs uppercase tracking-wider text-cyber-green mb-1 flex items-center gap-1"><Star size={12} /> Strategy</p>
                  <p className="text-sm text-ocean-100">{result.strategy}</p>
                </div>
                <div className="glass rounded-xl p-3 border border-cyber-red/20">
                  <p className="text-xs uppercase tracking-wider text-cyber-red mb-1 flex items-center gap-1"><ShieldAlert size={12} /> Risk Assessment</p>
                  <p className="text-sm text-ocean-100">{result.risk}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Recent complaints for context */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-cyber-yellow" /> Priority Suggestions from Recent Complaints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {complaints.slice(0, 6).map((c) => (
            <div key={c.id} className="cyber-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-semibold truncate">{c.title}</span>
                <span className={`text-[10px] uppercase font-bold ${c.priority === 'Critical' ? 'text-cyber-red' : c.priority === 'High' ? 'text-cyber-orange' : 'text-cyber-yellow'}`}>{c.priority}</span>
              </div>
              <p className="text-xs text-ocean-200/70 line-clamp-2">{c.description}</p>
              <p className="text-[10px] text-ocean-200/50 mt-2 font-mono">{c.emergency_type} • {c.client_name}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SummaryBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-ocean-200/70">{label}</p>
      <p className={`font-display text-xl font-bold ${color} mt-1`}>{value}</p>
    </div>
  );
}

function ResultBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-xs uppercase tracking-wider text-ocean-200/60 flex items-center gap-1">{icon}{label}</p>
      <p className={`font-display text-sm font-bold ${color} mt-1`}>{value}</p>
    </div>
  );
}
