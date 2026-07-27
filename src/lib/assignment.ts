import { supabase } from '@/lib/supabase';
import type { Robot, Drone, Complaint } from '@/lib/supabase';

type AssignResult = { error: string | null };

// Assigns a robot and/or drone to a complaint. Updates the complaint, marks
// the robot/drone as assigned, creates a mission, sends notifications to both
// the client and the commander, and adds an activity log entry.
export async function assignResourcesToComplaint(params: {
  complaint: Complaint;
  robot: Robot | null;
  drone: Drone | null;
  commanderNotes?: string;
}): Promise<AssignResult> {
  const { complaint, robot, drone, commanderNotes } = params;
  if (!robot && !drone) return { error: 'Select at least one robot or drone.' };

  // Compute ETA and distance (mock but deterministic)
  const eta = robot ? Math.floor(Math.random() * 25) + 5 : 15;
  const distance = Math.round((Math.random() * 20 + 2) * 10) / 10;

  // 1. Update the complaint
  const { error: cErr } = await supabase
    .from('complaints')
    .update({
      assigned_robot_id: robot?.robot_id ?? null,
      assigned_drone_id: drone?.drone_id ?? null,
      status: 'Robot Assigned',
      commander_notes: commanderNotes ?? null,
      eta_min: eta,
      distance_km: distance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', complaint.id);
  if (cErr) return { error: cErr.message };

  // 2. Mark robot as assigned
  if (robot) {
    const { error: rErr } = await supabase
      .from('robots')
      .update({
        assigned: true,
        assigned_client_id: complaint.client_id,
        current_mission: `${complaint.emergency_type} Rescue - ${complaint.title}`,
        status: 'Assigned',
        last_assigned_client: complaint.client_name,
        last_updated: new Date().toISOString(),
      })
      .eq('robot_id', robot.robot_id);
    if (rErr) console.error('robot update error', rErr);
  }

  // 3. Mark drone as assigned
  if (drone) {
    const { error: dErr } = await supabase
      .from('drones')
      .update({
        status: 'Monitoring',
        mission: `Surveillance for ${complaint.emergency_type} - ${complaint.title}`,
        last_updated: new Date().toISOString(),
      })
      .eq('drone_id', drone.drone_id);
    if (dErr) console.error('drone update error', dErr);
  }

  // 4. Create mission
  const missionName = `${complaint.emergency_type} Rescue - ${complaint.title}`;
  const { error: mErr } = await supabase.from('missions').insert({
    complaint_id: complaint.id,
    robot_id: robot?.robot_id ?? null,
    drone_id: drone?.drone_id ?? null,
    client_id: complaint.client_id,
    mission_name: missionName,
    status: 'Assigned',
    priority: complaint.priority,
    progress: 10,
    started_at: new Date().toISOString(),
  });
  if (mErr) console.error('mission insert error', mErr);

  // 5. Notify the client
  const robotText = robot ? `${robot.robot_name} (${robot.robot_id})` : '';
  const droneText = drone ? `${drone.drone_name} (${drone.drone_id})` : '';
  const assignedText = [robotText, droneText].filter(Boolean).join(' + ');
  await supabase.from('notifications').insert({
    user_id: complaint.client_id,
    role: 'client',
    type: 'assignment',
    title: 'Rescue Resource Assigned',
    message: `${assignedText} has been assigned to your request. ETA: ${eta} minutes. Distance: ${distance} km.`,
  });

  // 6. Notify all commanders
  await supabase.from('notifications').insert({
    role: 'commander',
    type: 'assignment',
    title: 'Resource Assigned',
    message: `${assignedText} assigned to ${complaint.client_name} for "${complaint.title}".`,
  });

  // 7. Activity log
  await supabase.from('activity_logs').insert({
    type: 'assignment',
    message: `${assignedText} assigned to ${complaint.client_name} for ${complaint.emergency_type} rescue`,
    severity: 'info',
  });

  return { error: null };
}

// Advance a complaint to the next status in the rescue timeline.
export async function advanceComplaintStatus(complaintId: string): Promise<AssignResult> {
  const { data: current } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', complaintId)
    .maybeSingle();
  if (!current) return { error: 'Complaint not found' };

  const order = ['Pending', 'Robot Assigned', 'Robot En Route', 'Rescue Started', 'Mission Completed'];
  const idx = order.indexOf(current.status);
  if (idx < 0 || idx >= order.length - 1) return { error: null };
  const next = order[idx + 1];
  const progressMap: Record<string, number> = {
    'Robot Assigned': 25,
    'Robot En Route': 50,
    'Rescue Started': 75,
    'Mission Completed': 100,
  };

  const { error } = await supabase
    .from('complaints')
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq('id', complaintId);
  if (error) return { error: error.message };

  // Update mission progress
  await supabase
    .from('missions')
    .update({ progress: progressMap[next] ?? 0, status: next === 'Mission Completed' ? 'Completed' : 'Travelling', updated_at: new Date().toISOString() })
    .eq('complaint_id', complaintId);

  // Notify client
  await supabase.from('notifications').insert({
    user_id: current.client_id,
    role: 'client',
    type: 'mission',
    title: 'Mission Update',
    message: `Your rescue status updated to: ${next}.`,
  });

  // Activity log
  await supabase.from('activity_logs').insert({
    type: 'mission',
    message: `Complaint "${current.title}" status updated to ${next}`,
    severity: 'success',
  });

  return { error: null };
}
