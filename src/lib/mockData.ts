// Mock data generation for Robo Web Sprint
import type { Robot, Drone, Alert, Resource, ActivityLog } from '@/lib/supabase';

const robotNames = [
  'Atlas Rescue', 'Titan Guard', 'Vanguard Scout', 'Sentinel Prime', 'Hermes Swift',
  'Colossus Heavy', 'Nimbus Flyer', 'Orion Hunter', 'Phoenix Riser', 'Aegis Shield',
  'Vulcan Forge', 'Helios Bright', 'Ares Warrior', 'Odyssey Trek', 'Pioneer Trek',
  'Nemesis Strike', 'Comet Dash', 'Falcon Eye', 'Bolt Strike', 'Quake Buster',
  'Storm Rider', 'Thunder Clap', 'Apex Climber', 'Summit Reach', 'Ranger Quest',
  'Cobra Strike', 'Mustang Rush', 'Panther Stealth', 'Grizzly Force', 'Dolphin Wave',
];

const robotTypes = [
  'Heavy Rescue', 'Search & Rescue', 'Medical Bot', 'Fire Fighter',
  'Debris Clearer', 'Underwater Rescue', 'Aerial Scout', 'Supply Carrier',
];

const droneNames = [
  'SkyEye-1', 'SkyEye-2', 'SkyEye-3', 'SkyEye-4', 'SkyEye-5',
  'Hawk Vision-1', 'Hawk Vision-2', 'Hawk Vision-3', 'Hawk Vision-4', 'Hawk Vision-5',
  'Falcon Cam-1', 'Falcon Cam-2', 'Falcon Cam-3', 'Falcon Cam-4', 'Falcon Cam-5',
  'Aero Scout-1', 'Aero Scout-2', 'Aero Scout-3', 'Aero Scout-4', 'Aero Scout-5',
];

const robotStatuses: Robot['status'][] = [
  'Available', 'Assigned', 'Travelling', 'Rescue Started', 'Returning', 'Charging', 'Offline',
];

const droneStatuses: Drone['status'][] = [
  'Available', 'Monitoring', 'Returning', 'Charging', 'Maintenance',
];

const locations = [
  'Sector A - Downtown', 'Sector B - Riverside', 'Sector C - Industrial Zone',
  'Sector D - Residential', 'Sector E - Coastal', 'Sector F - Hillside',
  'Sector G - Old Town', 'Sector H - New District', 'Sector I - Port Area', 'Sector J - Outskirts',
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

// Base coordinates (centered around a mock city)
const baseLat = 19.076;
const baseLng = 72.8777;

export function generateRobots(): Robot[] {
  return Array.from({ length: 30 }, (_, i) => {
    const id = `RB${String(i + 1).padStart(3, '0')}`;
    const status = pick(robotStatuses);
    const assigned = status !== 'Available' && status !== 'Offline' && status !== 'Charging';
    return {
      robot_id: id,
      robot_name: robotNames[i],
      robot_type: pick(robotTypes),
      battery_percentage: rand(30, 100),
      assigned,
      assigned_client_id: null,
      current_mission: assigned ? `${pick(['Earthquake', 'Flood', 'Fire', 'Landslide'])} Rescue Op` : null,
      status,
      signal_strength: rand(60, 100),
      temperature: randFloat(20, 45),
      speed: assigned ? randFloat(5, 35) : 0,
      current_location: pick(locations),
      latitude: baseLat + randFloat(-0.2, 0.2),
      longitude: baseLng + randFloat(-0.2, 0.2),
      total_rescue_missions: rand(5, 80),
      rescue_success_rate: rand(85, 99),
      avg_mission_time_min: rand(20, 120),
      performance_rating: rand(3, 5),
      last_maintenance_date: new Date(Date.now() - rand(1, 90) * 86400000).toISOString().slice(0, 10),
      last_assigned_client: assigned ? `Client${String(rand(1, 40)).padStart(3, '0')}` : null,
      last_updated: new Date().toISOString(),
    };
  });
}

export function generateDrones(): Drone[] {
  return Array.from({ length: 20 }, (_, i) => {
    const id = `DR${String(i + 1).padStart(3, '0')}`;
    const status = pick(droneStatuses);
    return {
      drone_id: id,
      drone_name: droneNames[i],
      battery: rand(30, 100),
      status,
      mission: status === 'Monitoring' ? 'Surveillance Op' : null,
      location: pick(locations),
      latitude: baseLat + randFloat(-0.25, 0.25),
      longitude: baseLng + randFloat(-0.25, 0.25),
      altitude: status === 'Monitoring' ? rand(80, 300) : 0,
      speed: status === 'Monitoring' ? randFloat(15, 50) : 0,
      camera_status: pick(['Active', 'Active', 'Active', 'Standby']),
      flight_hours: randFloat(20, 500),
      surveillance_missions: rand(5, 60),
      victims_detected: rand(0, 40),
      detection_accuracy: rand(85, 99),
      performance_rating: rand(3, 5),
      last_maintenance_date: new Date(Date.now() - rand(1, 90) * 86400000).toISOString().slice(0, 10),
      last_updated: new Date().toISOString(),
    };
  });
}

export function generateAlerts(): Alert[] {
  const types = ['Earthquake', 'Flood', 'Fire', 'Cyclone', 'Landslide', 'Building Collapse', 'Gas Leakage', 'Tsunami', 'Communication Failure'];
  const severities: Alert['severity'][] = ['Low', 'Medium', 'High', 'Critical'];
  const descs: Record<string, string> = {
    Earthquake: 'Magnitude 6.2 detected. Aftershocks expected. Immediate evacuation advised.',
    Flood: 'River overflow detected. Water levels rising in low-lying areas.',
    Fire: 'Wildfire spreading rapidly. Wind speed 25 km/h. Containment 30%.',
    Cyclone: 'Category 4 cyclone approaching landfall in 6 hours.',
    Landslide: 'Hillside instability detected. Multiple zones at risk.',
    'Building Collapse': 'Multi-story structure collapsed. Multiple victims reported.',
    'Gas Leakage': 'Underground pipeline rupture. Hazardous atmosphere confirmed.',
    Tsunami: 'Tsunami warning issued. Coastal evacuation in progress.',
    'Communication Failure': 'Primary comms tower offline. Switching to backup relay.',
  };
  return Array.from({ length: 25 }, (_, i) => {
    const type = pick(types);
    const active = i < 8;
    return {
      id: crypto.randomUUID(),
      alert_type: type,
      severity: pick(severities),
      location: pick(locations),
      latitude: baseLat + randFloat(-0.3, 0.3),
      longitude: baseLng + randFloat(-0.3, 0.3),
      description: descs[type],
      active,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    };
  });
}

export function generateResources(): Resource[] {
  const resources = [
    { name: 'Medical Kit', type: 'Medical', unit: 'units' },
    { name: 'Oxygen Cylinder', type: 'Medical', unit: 'cylinders' },
    { name: 'Food Pack', type: 'Survival', unit: 'packs' },
    { name: 'Water Bottle', type: 'Survival', unit: 'bottles' },
    { name: 'Blanket', type: 'Survival', unit: 'units' },
    { name: 'Tent', type: 'Shelter', unit: 'units' },
    { name: 'Rope', type: 'Rescue', unit: 'meters' },
    { name: 'Chain Saw', type: 'Equipment', unit: 'units' },
    { name: 'Generator', type: 'Power', unit: 'units' },
    { name: 'Fuel', type: 'Power', unit: 'liters' },
    { name: 'Life Jacket', type: 'Water Rescue', unit: 'units' },
    { name: 'Inflatable Boat', type: 'Water Rescue', unit: 'units' },
    { name: 'Radio', type: 'Communication', unit: 'units' },
    { name: 'Satellite Phone', type: 'Communication', unit: 'units' },
    { name: 'First Aid Kit', type: 'Medical', unit: 'kits' },
  ];
  return resources.map((r, i) => ({
    id: `RS${String(i + 1).padStart(3, '0')}`,
    name: r.name,
    type: r.type,
    quantity: rand(5, 200),
    unit: r.unit,
    location: pick(locations),
    status: pick(['Available', 'Available', 'Low Stock', 'Depleted']),
  }));
}

export function generateActivityLogs(): ActivityLog[] {
  const logs: { type: string; message: string; severity: string }[] = [
    { type: 'assignment', message: 'Robot RB012 assigned to Client C102', severity: 'info' },
    { type: 'drone', message: 'Drone DR005 detected flood expansion near Sector B', severity: 'warning' },
    { type: 'robot', message: 'Robot RB007 returned to charging station', severity: 'info' },
    { type: 'alert', message: 'Earthquake alert issued for Sector A', severity: 'critical' },
    { type: 'battery', message: 'Robot RB023 battery below 15%', severity: 'warning' },
    { type: 'complaint', message: 'Client submitted emergency request for Sector C', severity: 'info' },
    { type: 'mission', message: 'Mission M-045 completed successfully', severity: 'success' },
    { type: 'drone', message: 'Drone DR012 camera recalibrated', severity: 'info' },
    { type: 'robot', message: 'Robot RB003 entered rescue zone', severity: 'success' },
    { type: 'alert', message: 'Flood warning issued for Sector E', severity: 'warning' },
    { type: 'assignment', message: 'Drone DR008 assigned to Mission M-051', severity: 'info' },
    { type: 'robot', message: 'Robot RB018 signal strength restored', severity: 'info' },
    { type: 'mission', message: 'Mission M-038 status updated to Rescue Started', severity: 'info' },
    { type: 'drone', message: 'Drone DR003 detected 12 victims in Sector D', severity: 'warning' },
    { type: 'alert', message: 'Cyclone trajectory updated for coastal areas', severity: 'critical' },
    { type: 'robot', message: 'Robot RB010 maintenance completed', severity: 'success' },
    { type: 'battery', message: 'Drone DR015 battery at 22% - returning to base', severity: 'warning' },
    { type: 'complaint', message: 'New medical emergency complaint from Sector F', severity: 'info' },
    { type: 'robot', message: 'Robot RB025 reached target coordinates', severity: 'info' },
    { type: 'alert', message: 'Building collapse reported at Sector G', severity: 'critical' },
    { type: 'drone', message: 'Drone DR019 launched for surveillance in Sector H', severity: 'info' },
    { type: 'mission', message: 'Mission M-049 ETA updated to 18 minutes', severity: 'info' },
    { type: 'robot', message: 'Robot RB014 rescued 3 civilians', severity: 'success' },
    { type: 'complaint', message: 'Complaint resolved and marked completed', severity: 'success' },
    { type: 'alert', message: 'Gas leakage detected in Sector I industrial zone', severity: 'critical' },
    { type: 'drone', message: 'Drone DR006 returned from surveillance mission', severity: 'info' },
    { type: 'robot', message: 'Robot RB020 battery fully charged', severity: 'success' },
    { type: 'assignment', message: 'Robot RB028 assigned to Client C108', severity: 'info' },
    { type: 'alert', message: 'Communication failure reported at Sector J relay', severity: 'warning' },
    { type: 'mission', message: 'Mission M-052 initiated with 4 robots deployed', severity: 'info' },
  ];
  return logs.map((l) => ({
    id: crypto.randomUUID(),
    type: l.type,
    message: l.message,
    severity: l.severity,
    created_at: new Date(Date.now() - Math.random() * 3600000 * 6).toISOString(),
  })).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Commander credentials (predefined - seeded via edge function)
export const COMMANDER_CREDENTIALS = {
  commanderId: 'CMD001',
  email: 'commander@roboweb.ai',
  password: 'Commander@123',
  displayName: 'Sarah Johnson',
};

// Predefined client accounts (for demo)
export const SAMPLE_CLIENTS = Array.from({ length: 10 }, (_, i) => {
  const names = [
    'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh',
    'Anita Desai', 'Rohan Verma', 'Kavya Iyer', 'Arjun Nair', 'Meera Joshi',
  ];
  return {
    email: `client${i + 1}@roboweb.ai`,
    password: 'Client@123',
    displayName: names[i],
    phone: `+91${rand(7000000000, 9999999999)}`,
  };
});
