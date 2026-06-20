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
    const schedules = await prisma.schedule.findMany({
      where: { userId },
      include: { workout: true },
    });

    // compute progress: count workouts in current week and month
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
      where: { userId, date: { gte: startOfWeek, lt: endOfWeek } },
    });

    const monthlyCount = await prisma.workout.count({
      where: { userId, date: { gte: startOfMonth, lt: endOfMonth } },
    });

    return NextResponse.json({ goals, schedules, weeklyCount, monthlyCount });
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

    // handle creating/updating goal targets
    if (body.action === "saveGoal") {
      const { type, target } = body;
      const existing = await prisma.goal.findFirst({ where: { userId, type } });
      if (existing) {
        const updated = await prisma.goal.update({
          where: { id: existing.id },
          data: { target: Number(target) },
        });
        return NextResponse.json(updated);
      }
      const created = await prisma.goal.create({
        data: { userId, type, target: Number(target) },
      });
      return NextResponse.json(created, { status: 201 });
    }

    // handle creating a schedule assignment
    if (body.action === "assign") {
      const { workoutId, day } = body;
      const created = await prisma.schedule.create({
        data: { userId, workoutId: Number(workoutId), day: Number(day) },
      });
      return NextResponse.json(created, { status: 201 });
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

    const existing = await prisma.schedule.findUnique({ where: { id: Number(id) } });
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
