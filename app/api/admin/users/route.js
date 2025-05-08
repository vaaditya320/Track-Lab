import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logAdminAction } from "@/lib/logger";

// GET all users (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only the specified admin email can access
    if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        regId: true,
        role: true,
        branch: true,
        section: true,
        batch: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT to update user role (admin only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only the specified admin email can update roles
    if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Fetch user details before update for logging
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, name: true },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        regId: true,
        role: true
      }
    });

    // Log the admin action
    await logAdminAction(
      `User ${userToUpdate.name} (${userToUpdate.email}) role changed from ${userToUpdate.role} to ${role} by admin ${session.user.name} (${session.user.email})`
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  // Only the specified admin email can delete users
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id } = await req.json();

    // Fetch user details before deletion for logging
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true, name: true },
    });

    if (!userToDelete) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    // Log the admin action
    await logAdminAction(
      `User ${userToDelete.name} (${userToDelete.email}) (${userToDelete.role}) deleted by admin ${session.user.name} (${session.user.email})`
    );

    return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
  }
}
