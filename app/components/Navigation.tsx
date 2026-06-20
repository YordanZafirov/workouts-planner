"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Don't show navigation on signin page or if not authenticated
  if (!session || pathname === "/signin") {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left section: Brand + Navigation */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xl font-bold hover:text-blue-100 whitespace-nowrap"
          >
            Workout Planner
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex flex-row items-center gap-1 ml-6">
            <Link
              href="/"
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isActive("/")
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              href="/workouts"
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isActive("/workouts")
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              Workouts
            </Link>
            <Link
              href="/goals"
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isActive("/goals")
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              Goals
            </Link>
          </div>
        </div>

        {/* Right section: Mobile burger + Desktop user info */}
        <div className="flex items-center gap-3">
          {/* Mobile burger button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg bg-blue-700 hover:bg-blue-800 transition"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop user info */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-blue-100">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 md:hidden bg-blue-600 border-t border-blue-500">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              <Link
                href="/"
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isActive("/")
                    ? "bg-blue-500 text-white font-semibold"
                    : "text-blue-100 hover:bg-blue-600 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/workouts"
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isActive("/workouts")
                    ? "bg-blue-500 text-white font-semibold"
                    : "text-blue-100 hover:bg-blue-600 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Workouts
              </Link>
              <Link
                href="/goals"
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isActive("/goals")
                    ? "bg-blue-500 text-white font-semibold"
                    : "text-blue-100 hover:bg-blue-600 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Goals
              </Link>
              <div className="border-t border-blue-500 mt-2 pt-2 flex flex-col gap-2">
                <span className="text-sm text-blue-100 px-3 py-1">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
