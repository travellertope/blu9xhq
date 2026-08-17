"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Circle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  status: "planned" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
}

interface DailyLog {
  date: string;
  tasks: Task[];
  notes: string;
}

interface TeamMemberLog {
  userId: string;
  userName: string;
  log: DailyLog | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

const STATUS_OPTIONS: { value: Task["status"]; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: Task["priority"]; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

function StatusIcon({ status }: { status: Task["status"] }) {
  if (status === "done")
    return <Check className="h-4 w-4 text-green-500 shrink-0" />;
  if (status === "in_progress")
    return <Clock className="h-4 w-4 text-amber-500 shrink-0" />;
  return <Circle className="h-4 w-4 text-slate-300 shrink-0" />;
}

// ─── Date Picker Bar ──────────────────────────────────────────────────────────

function DatePickerBar({
  date,
  onChange,
}: {
  date: string;
  onChange: (d: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(shiftDate(date, -1))}
        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-1.5 text-sm text-slate-700 bg-white"
      />
      <button
        onClick={() => onChange(shiftDate(date, 1))}
        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="text-sm text-slate-500 ml-2 hidden sm:inline">
        {formatDisplayDate(new Date(date + "T00:00:00"))}
      </span>
    </div>
  );
}

// ─── My Logs Tab ──────────────────────────────────────────────────────────────

function MyLogsTab() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLog = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/daily-logs?date=${d}`);
      if (res.ok) {
        const data = await res.json();
        if (data.log) {
          setTasks(data.log.tasks ?? []);
          setNotes(data.log.notes ?? "");
        } else {
          setTasks([]);
          setNotes("");
        }
      } else {
        setTasks([]);
        setNotes("");
      }
    } catch {
      toast.error("Failed to load log");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLog(date);
  }, [date, loadLog]);

  function addTask() {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        status: "planned",
        priority: "medium",
      },
    ]);
  }

  function updateTask(id: string, field: keyof Task, value: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, tasks, notes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Log saved");
    } catch {
      toast.error("Failed to save log");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <DatePickerBar date={date} onChange={setDate} />

      <div className="rounded-lg border bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading log...
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Task list */}
            <div className="space-y-2">
              {tasks.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">
                  No tasks yet. Add your first task for the day.
                </p>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 rounded-md border border-slate-200 p-2"
                >
                  <StatusIcon status={task.status} />
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) =>
                      updateTask(task.id, "title", e.target.value)
                    }
                    placeholder="Task title..."
                    className={`flex-1 min-w-0 text-sm bg-transparent border-0 outline-none text-slate-800 placeholder:text-slate-300 ${
                      task.status === "done"
                        ? "line-through text-slate-400"
                        : ""
                    }`}
                  />
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateTask(task.id, "status", e.target.value)
                    }
                    className="text-xs border rounded-md px-2 py-1 bg-white text-slate-600"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      updateTask(task.id, "priority", e.target.value)
                    }
                    className={`text-xs border rounded-md px-2 py-1 ${
                      PRIORITY_COLORS[task.priority]
                    }`}
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addTask}
              className="text-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Task
            </Button>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional notes for the day..."
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={save}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Team Logs Tab ────────────────────────────────────────────────────────────

function TeamLogsTab() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [members, setMembers] = useState<TeamMemberLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loadTeam = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/daily-logs/team?date=${d}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members ?? []);
      }
    } catch {
      toast.error("Failed to load team logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam(date);
  }, [date, loadTeam]);

  function toggle(userId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function statusCounts(tasks: Task[]) {
    const counts = { planned: 0, in_progress: 0, done: 0 };
    tasks.forEach((t) => counts[t.status]++);
    return counts;
  }

  return (
    <div className="space-y-4">
      <DatePickerBar date={date} onChange={setDate} />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading team logs...
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-lg border bg-white py-16 text-center">
          <p className="text-sm text-slate-400">
            No team members found.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const isOpen = expanded.has(member.userId);
            const hasLog = member.log && member.log.tasks.length > 0;
            const counts = hasLog
              ? statusCounts(member.log!.tasks)
              : null;

            return (
              <div
                key={member.userId}
                className="rounded-lg border bg-white overflow-hidden"
              >
                <button
                  onClick={() => hasLog && toggle(member.userId)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-800">
                      {member.userName}
                    </span>
                    {hasLog ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Circle className="h-3 w-3 text-slate-300" />
                          {counts!.planned}
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Clock className="h-3 w-3" />
                          {counts!.in_progress}
                        </span>
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Check className="h-3 w-3" />
                          {counts!.done}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        No log submitted
                      </span>
                    )}
                  </div>
                  {hasLog &&
                    (isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ))}
                </button>

                {isOpen && hasLog && (
                  <div className="border-t px-4 py-3 space-y-2">
                    {member.log!.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <StatusIcon status={task.status} />
                        <span
                          className={
                            task.status === "done"
                              ? "line-through text-slate-400"
                              : "text-slate-700"
                          }
                        >
                          {task.title || "(untitled)"}
                        </span>
                        <span
                          className={`ml-auto text-xs rounded-full px-2 py-0.5 font-medium ${
                            PRIORITY_COLORS[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    ))}
                    {member.log!.notes && (
                      <p className="text-xs text-slate-500 mt-2 pt-2 border-t">
                        {member.log!.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DailyLogsPage() {
  const [activeTab, setActiveTab] = useState<"my" | "team">("my");
  const [canViewTeam, setCanViewTeam] = useState(false);
  const [checkedTeamAccess, setCheckedTeamAccess] = useState(false);

  useEffect(() => {
    // Probe team endpoint to determine if user has view_daily_logs permission
    fetch("/api/admin/daily-logs/team?date=" + formatDate(new Date()))
      .then((res) => {
        setCanViewTeam(res.ok);
        setCheckedTeamAccess(true);
      })
      .catch(() => setCheckedTeamAccess(true));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Plan and track your daily tasks.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b mb-6">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "my"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          My Logs
        </button>
        {checkedTeamAccess && canViewTeam && (
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "team"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Team Logs
          </button>
        )}
      </div>

      {activeTab === "my" ? <MyLogsTab /> : <TeamLogsTab />}
    </div>
  );
}
