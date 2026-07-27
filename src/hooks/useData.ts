import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Robot, Drone, Complaint, Mission, Notification, Alert, ActivityLog, Resource } from '@/lib/supabase';

// Central data hook for the commander dashboard: loads all operational data
// and subscribes to realtime changes so the dashboard stays live.
export function useCommanderData() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [
      { data: rb },
      { data: dr },
      { data: cp },
      { data: mi },
      { data: no },
      { data: al },
      { data: ac },
      { data: rs },
    ] = await Promise.all([
      supabase.from('robots').select('*').order('robot_id'),
      supabase.from('drones').select('*').order('drone_id'),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('missions').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('alerts').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('resources').select('*').order('id'),
    ]);
    setRobots((rb as Robot[]) ?? []);
    setDrones((dr as Drone[]) ?? []);
    setComplaints((cp as Complaint[]) ?? []);
    setMissions((mi as Mission[]) ?? []);
    setNotifications((no as Notification[]) ?? []);
    setAlerts((al as Alert[]) ?? []);
    setActivityLogs((ac as ActivityLog[]) ?? []);
    setResources((rs as Resource[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('commander-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'robots' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drones' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => load())
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [load]);

  return { robots, drones, complaints, missions, notifications, alerts, activityLogs, resources, loading, reload: load };
}

// Client-scoped data: only the client's own complaints and missions
export function useClientData(clientId: string | undefined) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) return;
    const [
      { data: cp },
      { data: mi },
      { data: no },
      { data: al },
    ] = await Promise.all([
      supabase.from('complaints').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
      supabase.from('missions').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').or(`user_id.eq.${clientId},role.eq.client`).order('created_at', { ascending: false }).limit(50),
      supabase.from('alerts').select('*').eq('active', true).order('created_at', { ascending: false }),
    ]);
    setComplaints((cp as Complaint[]) ?? []);
    setMissions((mi as Mission[]) ?? []);
    setNotifications((no as Notification[]) ?? []);
    setAlerts((al as Alert[]) ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
    if (!clientId) return;
    const channel = supabase
      .channel(`client-data-${clientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
        if (payload.eventType === 'INSERT' && (payload.new as Complaint)?.client_id === clientId) {
          load();
        } else if (payload.eventType === 'UPDATE') {
          load();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as Notification;
        if (n.user_id === clientId || n.role === 'client') load();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, () => load())
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [load, clientId]);

  return { complaints, missions, notifications, alerts, loading, reload: load };
}
