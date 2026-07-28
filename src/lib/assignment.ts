import { supabase } from '@/lib/supabase';
import type { Robot, Drone, Complaint, Profile } from '@/lib/supabase';

type AssignResult = { error: string | null };

// Assigns a robot and/or drone to a complaint atomically. Inserts into the
// `assignments` table (which has a UNIQUE constraint on complaint_id, preventing
// duplicate assignments). A database trigger then handles notifications to all
// commanders and the client, plus the activity log. We also update the complaint
// status and mark the robot/drone as assigned.
export async function assignResourcesToComplaint(params: {
  complaint: Complaint;
  robot: Robot | null;
  drone: Drone | null;
  commander: Profile;
  commanderNotes?: string;
}): Promise<AssignResult> {
  const { complaint, robot, drone, commander, commanderNotes } = params;
  if (!robot && !drone) return { error: 'Select at least one robot or drone.' };

  const eta = robot ? Math.floor(Math.random() * 25) + 5 : 15;
  const distance = Math.round((Math.random() * 20 + 2) * 10) / 10;
  const now = new Date().toISOString();

  // 1. Insert into assignments table — the UNIQUE constraint on complaint_id
  //    prevents duplicate assignments. If another commander assigned first,
  //    this insert fails and we return the error.
  const { error: aErr } = await supabase.from('assignments').insert({
    complaint_id: complaint.id,
    commander_id: commander.id,
    commander_name: commander.display_name,
    commander_display_id: commander.commander_id ?? 'CMD-???',
    robot_id: robot?.robot_id ?? null,
    drone_id: drone?.drone_id ?? null,
    assigned_at: now,
  });
  if (aErr) {
    if (aErr.code === '23505') {
      return { error: 'This complaint has already been assigned by another commander.' };
    }
    return { error: aErr.message };
  }

  // 2. Update the complaint status
  const { error: cErr } = await supabase
    .from('complaints')
    .update({
      assigned_robot_id: robot?.robot_id ?? null,
      assigned_drone_id: drone?.drone_id ?? null,
      status: 'Robot Assigned',
      commander_notes: commanderNotes ?? null,
      eta_min: eta,
      distance_km: distance,
      updated_at: now,
    })
    .eq('id', complaint.id);
  if (cErr) return { error: cErr.message };

  // 3. Mark robot as assigned
  if (robot) {
    const { error: rErr } = await supabase
      .from('robots')
      .update({
        assigned: true,
        assigned_client_id: complaint.client_id,
        current_mission: `${complaint.emergency_type} Rescue - ${complaint.title}`,
        status: 'Assigned',
        last_assigned_client: complaint.client_name,
        last_updated: now,
      })
      .eq('robot_id', robot.robot_id);
    if (rErr) console.error('robot update error', rErr);
  }

  // 4. Mark drone as assigned
  if (drone) {
    const { error: dErr } = await supabase
      .from('drones')
      .update({
        status: 'Monitoring',
        mission: `Surveillance for ${complaint.emergency_type} - ${complaint.title}`,
        last_updated: now,
      })
      .eq('drone_id', drone.drone_id);
    if (dErr) console.error('drone update error', dErr);
  }

  // 5. Create mission
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
    started_at: now,
  });
  if (mErr) console.error('mission insert error', mErr);

  // Notifications + activity log are handled by the DB trigger on assignments.

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

  await supabase
    .from('missions')
    .update({ progress: progressMap[next] ?? 0, status: next === 'Mission Completed' ? 'Completed' : 'Travelling', updated_at: new Date().toISOString() })
    .eq('complaint_id', complaintId);

  await supabase.from('notifications').insert({
    user_id: current.client_id,
    role: 'client',
    type: 'mission',
    title: 'Mission Update',
    message: `Your rescue status updated to: ${next}.`,
  });

  await supabase.from('activity_logs').insert({
    type: 'mission',
    message: `Complaint "${current.title}" status updated to ${next}`,
    severity: 'success',
  });

  return { error: null };
}
