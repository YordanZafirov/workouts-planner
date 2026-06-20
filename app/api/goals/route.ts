import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const goals = await prisma.goal.findMany({ where: { userId } });

    // compute progress: count completed workouts in current week and month
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const weeklyCount = await prisma.workout.count({
      where: {
        userId,
        completed: true,
        date: { gte: startOfWeek, lt: endOfWeek },
      },
    });

    const monthlyCount = await prisma.workout.count({
      where: {
        userId,
        completed: true,
        date: { gte: startOfMonth, lt: endOfMonth },
      },
    });

    return NextResponse.json({ goals, weeklyCount, monthlyCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    if (body.action === "saveGoals") {
      const weeklyTargetValue = Number(body.weeklyTarget ?? 0);
      const monthlyTargetValue = Number(body.monthlyTarget ?? 0);

      const existingWeekly = await prisma.goal.findFirst({
        where: { userId, type: "weekly" },
      });
      const existingMonthly = await prisma.goal.findFirst({
        where: { userId, type: "monthly" },
      });

      if (existingWeekly) {
        await prisma.goal.update({
          where: { id: existingWeekly.id },
          data: { target: weeklyTargetValue },
        });
      } else {
        await prisma.goal.create({
          data: { userId, type: "weekly", target: weeklyTargetValue },
        });
      }

      if (existingMonthly) {
        await prisma.goal.update({
          where: { id: existingMonthly.id },
          data: { target: monthlyTargetValue },
        });
      } else {
        await prisma.goal.create({
          data: { userId, type: "monthly", target: monthlyTargetValue },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existing = await prisma.schedule.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.schedule.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
