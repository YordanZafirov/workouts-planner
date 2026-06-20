import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workouts = await prisma.workout.findMany({
      where: { userId: parseInt(session.user.id) },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, date, duration, repetitions } =
      await request.json();

    if (!title || !date || !duration) {
      return NextResponse.json(
        { error: "Title, date, and duration are required" },
        { status: 400 },
      );
    }

    const workout = await prisma.workout.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        duration: parseInt(duration),
        repetitions: repetitions ? parseInt(repetitions) : null,
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, date, duration, repetitions } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 },
      );
    }

    const existingWorkout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
    });

    if (
      !existingWorkout ||
      existingWorkout.userId !== parseInt(session.user.id)
    ) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const workout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(repetitions !== undefined && {
          repetitions: repetitions ? parseInt(repetitions) : null,
        }),
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { error: "Failed to update workout" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 },
      );
    }

    const existingWorkout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
    });

    if (
      !existingWorkout ||
      existingWorkout.userId !== parseInt(session.user.id)
    ) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    await prisma.workout.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json(
      { error: "Failed to delete workout" },
      { status: 500 },
    );
  }
}
