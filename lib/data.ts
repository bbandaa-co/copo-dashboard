import { supabase } from "./supabase";
import type {
  Contractor,
  MilestoneKind,
  PipelineStage,
  Project,
  ProjectPhase,
  Status,
  Week,
} from "./types";

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*, tasks(*), blockers(*), timeline_milestones(*)")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Project[];
}

export async function addProject(input: {
  name: string;
  section: string;
  status: Status;
  team: string[];
  pipeline_stage?: PipelineStage | null;
}) {
  const { data, error } = await supabase
    .from("projects")
    .insert(input)
    .select("*, tasks(*), blockers(*), timeline_milestones(*)")
    .single();

  if (error) throw error;
  return data as unknown as Project;
}

export async function setPipelineStage(
  projectId: string,
  stage: PipelineStage
) {
  const { error } = await supabase
    .from("projects")
    .update({ pipeline_stage: stage })
    .eq("id", projectId);

  if (error) throw error;
}

export async function moveToActive(projectId: string) {
  const { error } = await supabase
    .from("projects")
    .update({
      status: "active",
      section: "Active clients",
      pipeline_stage: null,
    })
    .eq("id", projectId);

  if (error) throw error;
}

export async function setProjectPhase(
  projectId: string,
  phase: ProjectPhase | null
) {
  const { error } = await supabase
    .from("projects")
    .update({ project_phase: phase })
    .eq("id", projectId);

  if (error) throw error;
}

export async function addTask(projectId: string, title: string, week: Week) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ project_id: projectId, title, week, manually_edited: true })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setTaskDone(taskId: string, done: boolean) {
  const { error } = await supabase
    .from("tasks")
    .update({ done, manually_edited: true })
    .eq("id", taskId);

  if (error) throw error;
}

export async function updateTaskTitle(taskId: string, title: string) {
  const { error } = await supabase
    .from("tasks")
    .update({ title, manually_edited: true })
    .eq("id", taskId);

  if (error) throw error;
}

export async function setTaskWeek(taskId: string, week: Week) {
  const { error } = await supabase
    .from("tasks")
    .update({ week, manually_edited: true })
    .eq("id", taskId);

  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export async function updateBlockerText(blockerId: string, text: string) {
  const { error } = await supabase
    .from("blockers")
    .update({ text, manually_edited: true })
    .eq("id", blockerId);

  if (error) throw error;
}

export async function resolveBlocker(blockerId: string) {
  const { error } = await supabase
    .from("blockers")
    .update({ resolved: true, manually_edited: true })
    .eq("id", blockerId);

  if (error) throw error;
}

export async function addMilestone(
  projectId: string,
  title: string,
  date: string,
  kind: MilestoneKind
) {
  const { data, error } = await supabase
    .from("timeline_milestones")
    .insert({ project_id: projectId, title, date, kind })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setMilestoneCompleted(
  milestoneId: string,
  completed: boolean
) {
  const { error } = await supabase
    .from("timeline_milestones")
    .update({ completed })
    .eq("id", milestoneId);

  if (error) throw error;
}

export async function deleteMilestone(milestoneId: string) {
  const { error } = await supabase
    .from("timeline_milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) throw error;
}

export async function fetchContractors(): Promise<Contractor[]> {
  const { data, error } = await supabase
    .from("contractors")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Contractor[];
}

export async function addContractor(input: {
  name: string;
  role: string | null;
  start_date: string | null;
  end_date: string | null;
  full_time: boolean;
}) {
  const { data, error } = await supabase
    .from("contractors")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Contractor;
}

export async function deleteContractor(contractorId: string) {
  const { error } = await supabase
    .from("contractors")
    .delete()
    .eq("id", contractorId);

  if (error) throw error;
}
