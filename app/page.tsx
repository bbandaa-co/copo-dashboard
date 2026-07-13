"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar, { sectionsInOrder, type View } from "@/components/Sidebar";
import ProjectCardList from "@/components/ProjectCardList";
import KeyIntel from "@/components/KeyIntel";
import ContractorsView from "@/components/ContractorsView";
import CalendarView from "@/components/CalendarView";
import AddClientModal from "@/components/AddClientModal";
import {
  addContractor,
  addMilestone,
  addProject,
  addTask,
  deleteContractor,
  deleteMilestone,
  deleteTask,
  fetchContractors,
  fetchProjects,
  moveToActive,
  resolveBlocker,
  setMilestoneCompleted,
  setPipelineStage,
  setProjectPhase,
  setTaskDone,
  setTaskWeek,
  updateBlockerText,
  updateTaskTitle,
} from "@/lib/data";
import type {
  Contractor,
  MilestoneKind,
  PipelineStage,
  Project,
  ProjectPhase,
  Status,
  Week,
} from "@/lib/types";

const CLOSED_PIPELINE_STAGES: PipelineStage[] = ["closed_won", "closed_lost", "ghost"];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ type: "overview" });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState("Active clients");

  useEffect(() => {
    Promise.all([fetchProjects(), fetchContractors()])
      .then(([p, c]) => {
        setProjects(p);
        setContractors(c);
      })
      .catch((e) => setSyncError(String(e.message ?? e)))
      .finally(() => setLoading(false));
  }, []);

  function updateProject(projectId: string, updater: (p: Project) => Project) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updater(p) : p))
    );
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (focusedId === id) setFocusedId(null);
  }

  async function handleToggleTask(
    projectId: string,
    taskId: string,
    done: boolean
  ) {
    updateProject(projectId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)),
    }));
    try {
      await setTaskDone(taskId, done);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleDeleteTask(projectId: string, taskId: string) {
    updateProject(projectId, (p) => ({
      ...p,
      tasks: p.tasks.filter((t) => t.id !== taskId),
    }));
    try {
      await deleteTask(taskId);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleAddTask(projectId: string, week: Week, title: string) {
    try {
      const task = await addTask(projectId, title, week);
      updateProject(projectId, (p) => ({ ...p, tasks: [...p.tasks, task] }));
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleEditTask(
    projectId: string,
    taskId: string,
    title: string
  ) {
    updateProject(projectId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, title } : t)),
    }));
    try {
      await updateTaskTitle(taskId, title);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleMoveTaskWeek(
    projectId: string,
    taskId: string,
    week: Week
  ) {
    updateProject(projectId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, week } : t)),
    }));
    try {
      await setTaskWeek(taskId, week);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleBlockerTextChange(
    projectId: string,
    blockerId: string,
    text: string
  ) {
    updateProject(projectId, (p) => ({
      ...p,
      blockers: p.blockers.map((b) =>
        b.id === blockerId ? { ...b, text } : b
      ),
    }));
    try {
      await updateBlockerText(blockerId, text);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleResolveBlocker(projectId: string, blockerId: string) {
    updateProject(projectId, (p) => ({
      ...p,
      blockers: p.blockers.map((b) =>
        b.id === blockerId ? { ...b, resolved: true } : b
      ),
    }));
    try {
      await resolveBlocker(blockerId);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleAddProject(input: {
    name: string;
    section: string;
    status: Status;
    team: string[];
    pipeline_stage?: PipelineStage | null;
  }) {
    try {
      const project = await addProject(input);
      setProjects((prev) => [...prev, project]);
      setModalOpen(false);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleChangeStage(projectId: string, stage: PipelineStage) {
    updateProject(projectId, (p) => ({ ...p, pipeline_stage: stage }));
    try {
      await setPipelineStage(projectId, stage);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleMoveToActive(projectId: string) {
    updateProject(projectId, (p) => ({
      ...p,
      status: "active",
      section: "Active clients",
      pipeline_stage: null,
    }));
    try {
      await moveToActive(projectId);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleChangePhase(projectId: string, phase: ProjectPhase | null) {
    updateProject(projectId, (p) => ({ ...p, project_phase: phase }));
    try {
      await setProjectPhase(projectId, phase);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleAddMilestone(
    projectId: string,
    title: string,
    date: string,
    kind: MilestoneKind
  ) {
    try {
      const milestone = await addMilestone(projectId, title, date, kind);
      updateProject(projectId, (p) => ({
        ...p,
        timeline_milestones: [...p.timeline_milestones, milestone],
      }));
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleToggleMilestoneCompleted(
    projectId: string,
    milestoneId: string,
    completed: boolean
  ) {
    updateProject(projectId, (p) => ({
      ...p,
      timeline_milestones: p.timeline_milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed } : m
      ),
    }));
    try {
      await setMilestoneCompleted(milestoneId, completed);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleDeleteMilestone(projectId: string, milestoneId: string) {
    updateProject(projectId, (p) => ({
      ...p,
      timeline_milestones: p.timeline_milestones.filter(
        (m) => m.id !== milestoneId
      ),
    }));
    try {
      await deleteMilestone(milestoneId);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleAddContractor(input: {
    name: string;
    role: string;
    startDate: string;
    endDate: string;
    fullTime: boolean;
  }) {
    try {
      const contractor = await addContractor({
        name: input.name,
        role: input.role || null,
        start_date: input.startDate || null,
        end_date: input.fullTime ? null : input.endDate,
        full_time: input.fullTime,
      });
      setContractors((prev) => [...prev, contractor]);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  async function handleDeleteContractor(id: string) {
    setContractors((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteContractor(id);
    } catch (e) {
      setSyncError(String((e as Error).message ?? e));
    }
  }

  function selectProject(section: string, projectId: string) {
    setView({ type: "section", section });
    setFocusedId(projectId);
  }

  const stats = useMemo(() => {
    const activeClients = projects.filter(
      (p) => p.section === "Active clients"
    ).length;
    const wrapping = projects.filter((p) => p.section === "Wrapping").length;
    const pipeline = projects.filter(
      (p) =>
        p.section === "Pipeline" &&
        !(p.pipeline_stage && CLOSED_PIPELINE_STAGES.includes(p.pipeline_stage))
    ).length;
    const openBlockers = projects.reduce(
      (sum, p) => sum + p.blockers.filter((b) => !b.resolved).length,
      0
    );
    return { activeClients, wrapping, pipeline, openBlockers };
  }, [projects]);

  const cardListProps = {
    expandedIds,
    focusedId,
    onToggleExpand: toggleExpand,
    onToggleTask: handleToggleTask,
    onDeleteTask: handleDeleteTask,
    onAddTask: handleAddTask,
    onEditTask: handleEditTask,
    onMoveTaskWeek: handleMoveTaskWeek,
    onBlockerTextChange: handleBlockerTextChange,
    onResolveBlocker: handleResolveBlocker,
    onChangeStage: handleChangeStage,
    onMoveToActive: handleMoveToActive,
    onChangePhase: handleChangePhase,
    onAddMilestone: handleAddMilestone,
    onToggleMilestoneCompleted: handleToggleMilestoneCompleted,
    onDeleteMilestone: handleDeleteMilestone,
  };

  return (
    <div className="shell">
      <Sidebar
        projects={projects}
        contractors={contractors}
        view={view}
        onSelectView={(v) => {
          setView(v);
          setFocusedId(null);
        }}
        onSelectProject={selectProject}
        onAddClient={(section) => {
          setModalSection(section);
          setModalOpen(true);
        }}
        onAddSection={() => {
          setModalSection("");
          setModalOpen(true);
        }}
      />

      <main className="main">
        {syncError && (
          <div
            style={{
              background: "var(--danger-light)",
              color: "var(--danger-text)",
              padding: "8px 12px",
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {syncError}
          </div>
        )}

        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : view.type === "intel" ? (
          <KeyIntel />
        ) : view.type === "contractors" ? (
          <ContractorsView
            contractors={contractors}
            onAdd={handleAddContractor}
            onDelete={handleDeleteContractor}
          />
        ) : view.type === "calendar" ? (
          <CalendarView
            projects={projects}
            onAddMilestone={handleAddMilestone}
            onSelectProject={selectProject}
          />
        ) : view.type === "overview" ? (
          <>
            <div className="page-header">
              <div className="header-left">
                <div className="week-label">State of Affairs</div>
                <div className="week-title">Overview</div>
              </div>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="stat-n">{stats.activeClients}</div>
                <div className="stat-l">Active clients</div>
              </div>
              <div className="stat">
                <div className="stat-n">{stats.wrapping}</div>
                <div className="stat-l">Wrapping</div>
              </div>
              <div className="stat">
                <div className="stat-n">{stats.openBlockers}</div>
                <div className="stat-l">Open blockers</div>
              </div>
              <div className="stat">
                <div className="stat-n">{stats.pipeline}</div>
                <div className="stat-l">Pipeline</div>
              </div>
            </div>
            <ProjectCardList
              title="Active clients"
              projects={projects.filter((p) => p.section === "Active clients")}
              {...cardListProps}
            />
            <div style={{ marginTop: 20 }}>
              <ProjectCardList
                title="Wrapping"
                projects={projects.filter((p) => p.section === "Wrapping")}
                {...cardListProps}
              />
            </div>
          </>
        ) : (
          <>
            <div className="page-header">
              <div className="header-left">
                <div className="week-label">
                  {sectionsInOrder(projects).includes(view.section)
                    ? view.section
                    : "Section"}
                </div>
                <div className="week-title">{view.section}</div>
              </div>
            </div>
            <ProjectCardList
              projects={projects.filter((p) => p.section === view.section)}
              {...cardListProps}
            />
          </>
        )}
      </main>

      <AddClientModal
        key={`${modalSection}-${modalOpen}`}
        open={modalOpen}
        defaultSection={modalSection}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddProject}
      />
    </div>
  );
}
