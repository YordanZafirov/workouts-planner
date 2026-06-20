"use client";

import { useEffect, useMemo, useState } from "react";

function percent(value: number) {
  return Math.min(100, Math.max(0, value));
}

type GoalData = { type: string; target: number };

export default function GoalsPage() {
  const [weeklyTarget, setWeeklyTarget] = useState<number>(0);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/goals");
    if (res.ok) {
      const data = await res.json();
      const goals: GoalData[] = data.goals || [];
      const weekGoal = goals.find((goal) => goal.type === "weekly");
      const monthGoal = goals.find((goal) => goal.type === "monthly");
      setWeeklyTarget(weekGoal?.target || 0);
      setMonthlyTarget(monthGoal?.target || 0);
      setWeeklyCount(data.weeklyCount || 0);
      setMonthlyCount(data.monthlyCount || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, []);

  const saveGoals = async () => {
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveGoals",
        weeklyTarget,
        monthlyTarget,
      }),
    });
    if (res.ok) {
      await fetchData();
    }
    setSaving(false);
  };

  const weeklyRatio = useMemo(
    () => (weeklyTarget > 0 ? percent((weeklyCount / weeklyTarget) * 100) : 0),
    [weeklyCount, weeklyTarget],
  );
  const monthlyRatio = useMemo(
    () =>
      monthlyTarget > 0 ? percent((monthlyCount / monthlyTarget) * 100) : 0,
    [monthlyCount, monthlyTarget],
  );

  const weeklyRemaining = Math.max(0, weeklyTarget - weeklyCount);
  const monthlyRemaining = Math.max(0, monthlyTarget - monthlyCount);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Fitness Goals
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Goal Management
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Define your weekly and monthly workout targets, then mark workouts as
          finished to track progress.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Goal Settings
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Weekly & Monthly Targets
              </h2>
            </div>
            <button
              onClick={saveGoals}
              disabled={saving || loading}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving ? "Saving..." : "Save Goals"}
            </button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <span className="text-sm font-medium text-slate-700">
                Weekly Goal
              </span>
              <input
                type="number"
                min={0}
                value={weeklyTarget}
                onChange={(event) =>
                  setWeeklyTarget(Number(event.target.value))
                }
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <span className="text-sm font-medium text-slate-700">
                Monthly Goal
              </span>
              <input
                type="number"
                min={0}
                value={monthlyTarget}
                onChange={(event) =>
                  setMonthlyTarget(Number(event.target.value))
                }
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Tracking
          </p>
          <h3 className="mt-4 text-2xl font-semibold text-slate-900">
            Progress at a glance
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Only workouts marked as finished contribute to your targets. Save
            goals first, then use the Workouts page to finish entries.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Weekly Goal Progress
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {weeklyTarget || 0}
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {weeklyRatio.toFixed(0)}%
            </span>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="font-semibold text-slate-900">
                {weeklyCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Remaining</span>
              <span className="font-semibold text-slate-900">
                {weeklyRemaining}
              </span>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${weeklyRatio}%` }}
            />
          </div>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Monthly Goal Progress
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {monthlyTarget || 0}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              {monthlyRatio.toFixed(0)}%
            </span>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="font-semibold text-slate-900">
                {monthlyCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Remaining</span>
              <span className="font-semibold text-slate-900">
                {monthlyRemaining}
              </span>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${monthlyRatio}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
