"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Don't show navigation on signin page or if not authenticated
  if (!session || pathname === "/signin") {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold hover:text-blue-100">
            Workout Planner
          </Link>
          <div className="flex gap-4">
            <Link
              href="/"
              className={`${
                isActive("/") ? "font-bold underline" : "hover:text-blue-100"
              }`}
            >
              Home
            </Link>
            <Link
              href="/workouts"
              className={`${
                isActive("/workouts") ? "font-bold underline" : "hover:text-blue-100"
              }`}
            >
              Workouts
            </Link>
            <Link
              href="/goals"
              className={`${
                isActive("/goals") ? "font-bold underline" : "hover:text-blue-100"
              }`}
            >
              Goals
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">{session.user?.name || session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
