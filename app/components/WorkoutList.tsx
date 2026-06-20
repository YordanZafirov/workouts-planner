"use client";

interface Workout {
  id: number;
  title: string;
  description?: string;
  date: string;
  duration: number;
  repetitions?: number;
}

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function WorkoutList({
  workouts,
  onEdit,
  onDelete,
  isLoading,
}: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No workouts yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {workout.title}
              </h3>
              {workout.description && (
                <p className="text-gray-600 text-sm mt-1">
                  {workout.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(workout)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(workout.id)}
                disabled={isLoading}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-400 transition"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-4">
            <div>
              <span className="font-medium">Date:</span>{" "}
              {new Date(workout.date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {workout.duration}{" "}
              min
            </div>
            {workout.repetitions && (
              <div>
                <span className="font-medium">Reps:</span> {workout.repetitions}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
