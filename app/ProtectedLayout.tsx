"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't require authentication
  const publicRoutes = ["/signin"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoute) {
      router.push("/signin");
    }
  }, [status, isPublicRoute, router]);

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Allow public routes to render without authentication
  if (isPublicRoute) {
    return <main className="flex-1">{children}</main>;
  }

  // Protect authenticated routes
  if (!session) {
    return null;
  }

  return <main className="flex-1">{children}</main>;
}
