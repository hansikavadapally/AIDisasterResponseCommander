import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export type Role = 'commander' | 'client';

export type Profile = {
  id: string;
  role: Role;
  display_name: string;
  email: string;
  phone: string | null;
  commander_id: string | null;
  created_at: string;
};

export type Robot = {
  robot_id: string;
  robot_name: string;
  robot_type: string;
  battery_percentage: number;
  assigned: boolean;
  assigned_client_id: string | null;
  current_mission: string | null;
  status: 'Available' | 'Assigned' | 'Travelling' | 'Rescue Started' | 'Returning' | 'Charging' | 'Offline';
  signal_strength: number;
  temperature: number;
  speed: number;
  current_location: string | null;
  latitude: number | null;
  longitude: number | null;
  total_rescue_missions: number;
  rescue_success_rate: number;
  avg_mission_time_min: number;
  performance_rating: number;
  last_maintenance_date: string | null;
  last_assigned_client: string | null;
  last_updated: string;
};

export type Drone = {
  drone_id: string;
  drone_name: string;
  battery: number;
  status: 'Available' | 'Monitoring' | 'Returning' | 'Charging' | 'Maintenance';
  mission: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number;
  speed: number;
  camera_status: string;
  flight_hours: number;
  surveillance_missions: number;
  victims_detected: number;
  detection_accuracy: number;
  performance_rating: number;
  last_maintenance_date: string | null;
  last_updated: string;
};

export type Complaint = {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  description: string;
  emergency_type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Robot Assigned' | 'Robot En Route' | 'Rescue Started' | 'Mission Completed' | 'Cancelled';
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  assigned_robot_id: string | null;
  assigned_drone_id: string | null;
  image_url: string | null;
  commander_notes: string | null;
  eta_min: number | null;
  distance_km: number | null;
  created_at: string;
  updated_at: string;
};

export type Mission = {
  id: string;
  complaint_id: string | null;
  robot_id: string | null;
  drone_id: string | null;
  client_id: string | null;
  mission_name: string;
  status: 'Pending' | 'Assigned' | 'Travelling' | 'Rescue Started' | 'Returning' | 'Completed' | 'Failed';
  priority: string;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string | null;
  role: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type Alert = {
  id: string;
  alert_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  active: boolean;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  type: string;
  message: string;
  severity: string;
  created_at: string;
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string | null;
  location: string | null;
  status: string;
};
