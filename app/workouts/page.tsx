"use client";

import { useEffect, useState } from "react";
import WorkoutForm from "../components/WorkoutForm";
import WorkoutList from "../components/WorkoutList";

interface Workout {
  id: number;
  title: string;
  description?: string;
  date: string;
  duration: number;
  repetitions?: number;
  completed: boolean;
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function fetchWorkouts() {
    setLoading(true);
    try {
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await fetchWorkouts();
    })();
  }, []);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (editingWorkout) {
        const response = await fetch("/api/workouts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setEditingWorkout(null);
          setShowForm(false);
          fetchWorkouts();
        }
      } else {
        const response = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setShowForm(false);
          fetchWorkouts();
        }
      }
    } catch (error) {
      console.error("Error saving workout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/workouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: true }),
      });

      if (response.ok) {
        fetchWorkouts();
      }
    } catch (error) {
      console.error("Error marking workout finished:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingWorkout(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600 mt-2">Manage your fitness workouts</p>
        </div>
        <button
          onClick={() => {
            setEditingWorkout(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-medium"
        >
          {showForm ? "Cancel" : "New Workout"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {showForm && (
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {editingWorkout ? "Edit Workout" : "Create Workout"}
              </h2>
              <WorkoutForm
                initialData={editingWorkout || undefined}
                onSubmit={handleSubmit}
                isLoading={loading}
              />
              {editingWorkout && (
                <button
                  onClick={handleCancel}
                  className="w-full mt-2 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        )}

        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            All Workouts ({workouts.length})
          </h2>
          {loading && workouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading workouts...</p>
            </div>
          ) : (
            <WorkoutList
              workouts={workouts}
              onEdit={handleEdit}
              onFinish={handleFinish}
              isLoading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
