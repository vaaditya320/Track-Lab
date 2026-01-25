import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { isSuperAdmin } from "@/lib/isSuperAdmin";

// GET all overlords
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is super admin
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const overlords = await prisma.overlord.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(overlords);
  } catch (error) {
    console.error("Error fetching overlords:", error);
    return NextResponse.json(
      { error: "Failed to fetch overlords" },
      { status: 500 }
    );
  }
}

// POST to create a new overlord
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is super admin
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if overlord with this email already exists
    const existingOverlord = await prisma.overlord.findUnique({
      where: { email },
    });

    if (existingOverlord) {
      return NextResponse.json(
        { error: "An overlord with this email already exists" },
        { status: 409 }
      );
    }

    // Create new overlord
    const overlord = await prisma.overlord.create({
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(overlord, { status: 201 });
  } catch (error) {
    console.error("Error creating overlord:", error);
    return NextResponse.json(
      { error: "Failed to create overlord" },
      { status: 500 }
    );
  }
}

// DELETE to remove an overlord
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is super admin
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Overlord ID is required" },
        { status: 400 }
      );
    }

    // Check if overlord exists
    const existingOverlord = await prisma.overlord.findUnique({
      where: { id },
    });

    if (!existingOverlord) {
      return NextResponse.json(
        { error: "Overlord not found" },
        { status: 404 }
      );
    }

    // Delete overlord
    await prisma.overlord.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Overlord deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting overlord:", error);
    return NextResponse.json(
      { error: "Failed to delete overlord" },
      { status: 500 }
    );
  }
}
