"use client";

import { useEffect, useState } from "react";

interface Workout {
  id: number;
  title: string;
  date: string;
}

export default function GoalsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(0);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [monthlyCount, setMonthlyCount] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [wRes, gRes] = await Promise.all([
      fetch("/api/workouts"),
      fetch("/api/goals"),
    ]);

    if (wRes.ok) {
      const wdata = await wRes.json();
      setWorkouts(wdata);
    }

    if (gRes.ok) {
      const gdata = await gRes.json();
      setSchedules(gdata.schedules || []);
      const weekGoal = (gdata.goals || []).find((g: any) => g.type === "weekly");
      const monthGoal = (gdata.goals || []).find((g: any) => g.type === "monthly");
      setWeeklyTarget(weekGoal?.target || 0);
      setMonthlyTarget(monthGoal?.target || 0);
      setWeeklyCount(gdata.weeklyCount || 0);
      setMonthlyCount(gdata.monthlyCount || 0);
    }
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const assignWorkout = async (dayIndex: number, workoutId: number | null) => {
    if (!workoutId) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", workoutId, day: dayIndex }),
    });
    if (res.ok) fetchData();
  };

  const removeAssignment = async (id: number) => {
    const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const saveTarget = async (type: string, target: number) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveGoal", type, target }),
    });
    if (res.ok) fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Goals</h1>
      <p className="text-gray-600 mb-8">Plan your weekly workout schedule and set long-term fitness goals.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Weekly Target</h2>
          <div className="flex gap-2">
            <input type="number" value={weeklyTarget} onChange={(e) => setWeeklyTarget(Number(e.target.value))} className="w-24 px-3 py-2 border rounded" />
            <button onClick={() => saveTarget("weekly", weeklyTarget)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          </div>
          <p className="mt-4 text-sm text-gray-600">Progress: {weeklyCount} / {weeklyTarget}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Target</h2>
          <div className="flex gap-2">
            <input type="number" value={monthlyTarget} onChange={(e) => setMonthlyTarget(Number(e.target.value))} className="w-24 px-3 py-2 border rounded" />
            <button onClick={() => saveTarget("monthly", monthlyTarget)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          </div>
          <p className="mt-4 text-sm text-gray-600">Progress: {monthlyCount} / {monthlyTarget}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="text-gray-600">Assign workouts to weekdays and track progress here. Targets help you stay consistent.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {days.map((d, i) => {
            const assigned = schedules.find(s => s.day === i);
            return (
              <div key={d} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <strong>{d}</strong>
                  {assigned ? (
                    <button onClick={() => removeAssignment(assigned.id)} className="text-red-600">Remove</button>
                  ) : null}
                </div>
                {assigned ? (
                  <div>
                    <div className="mb-2">{assigned.workout.title}</div>
                    <div className="text-sm text-gray-600">{new Date(assigned.workout.date).toLocaleDateString()}</div>
                  </div>
                ) : (
                  <select onChange={(e) => assignWorkout(i, Number(e.target.value))} defaultValue="">
                    <option value="">Assign workout...</option>
                    {workouts.map(w => (
                      <option key={w.id} value={w.id}>{w.title} — {new Date(w.date).toLocaleDateString()}</option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
