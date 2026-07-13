"use client";

import { useState } from "react";
import type { PipelineStage, Status } from "@/lib/types";

export default function AddClientModal({
  open,
  defaultSection,
  onClose,
  onSubmit,
}: {
  open: boolean;
  defaultSection: string;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    section: string;
    status: Status;
    team: string[];
    pipeline_stage?: PipelineStage | null;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [section, setSection] = useState(defaultSection);
  const [status, setStatus] = useState<Status>("active");
  const [team, setTeam] = useState("");
  const [stage, setStage] = useState<PipelineStage>("talks");

  if (!open) return null;

  function submit() {
    const trimmed = name.trim();
    const trimmedSection = section.trim();
    if (!trimmed || !trimmedSection) return;
    onSubmit({
      name: trimmed,
      section: trimmedSection,
      status,
      team: team
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      pipeline_stage: status === "pipeline" ? stage : null,
    });
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-title">Add client</div>
        <div className="modal-field">
          <div className="modal-label">Name</div>
          <input
            className="modal-input"
            placeholder="Client or lead name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="modal-field">
          <div className="modal-label">Section</div>
          <input
            className="modal-input"
            placeholder="e.g. Active clients"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
        </div>
        <div className="modal-field">
          <div className="modal-label">Status</div>
          <select
            className="modal-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <option value="active">Active</option>
            <option value="retainer">Retainer</option>
            <option value="wrapping">Wrapping</option>
            <option value="pipeline">Pipeline</option>
          </select>
        </div>
        {status === "pipeline" && (
          <div className="modal-field">
            <div className="modal-label">Pipeline stage</div>
            <select
              className="modal-select"
              value={stage}
              onChange={(e) => setStage(e.target.value as PipelineStage)}
            >
              <option value="talks">Talks</option>
              <option value="proposal">Proposal</option>
              <option value="refinement">Refinement</option>
              <option value="closed_won">Closed · Won</option>
              <option value="closed_lost">Closed · Lost</option>
              <option value="ghost">Ghosted</option>
            </select>
          </div>
        )}
        <div className="modal-field">
          <div className="modal-label">Team (comma separated)</div>
          <input
            className="modal-input"
            placeholder="e.g. Aimee, Brian"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
