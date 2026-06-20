"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Workout {
  id: number;
  title: string;
  date: string;
  duration: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentWorkouts();
  }, []);

  const fetchRecentWorkouts = async () => {
    try {
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        setRecentWorkouts(data.slice(0, 5)); // Get last 5 workouts
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome, {session?.user?.email}!
        </h1>
        <p className="text-gray-600 text-lg">
          Stay on top of your fitness goals with our simple workout planner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Manage Workouts
          </h3>
          <p className="text-gray-600 mb-4">
            Create, edit, and delete your workouts with ease.
          </p>
          <Link
            href="/workouts"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Go to Workouts
          </Link>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Plan Your Week
          </h3>
          <p className="text-gray-600 mb-4">
            Assign workouts to specific days of the week.
          </p>
          <Link
            href="/goals"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Go to Goals
          </Link>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Track Progress
          </h3>
          <p className="text-gray-600 mb-4">
            View your recent workouts and stay motivated.
          </p>
          <div className="text-2xl font-bold text-purple-600">
            {recentWorkouts.length} workouts
          </div>
        </div>
      </div>

      {recentWorkouts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Workouts
          </h2>
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-200"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {workout.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(workout.date).toLocaleDateString()} •{" "}
                    {workout.duration} min
                  </p>
                </div>
                <Link
                  href="/workouts"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
