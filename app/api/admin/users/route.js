import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logAdminAction } from "@/lib/logger";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  // Only the specified admin email can access
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const users = await prisma.user.findMany();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);

  // Only the specified admin email can promote/demote users
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id, action } = await req.json();

    if (!id || !["PROMOTE", "DEMOTE"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
    }

    // Fetch current user role and email
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true, name: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Determine new role
    const newRole = action === "PROMOTE" ? "ADMIN" : "STUDENT";

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    // Log the admin action
    await logAdminAction(
      `User ${user.name} (${user.email}) ${action.toLowerCase()}d from ${user.role} to ${newRole} by admin ${session.user.name} (${session.user.email})`
    );

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return new Response(JSON.stringify({ error: "Failed to update user role" }), { status: 500 });
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
