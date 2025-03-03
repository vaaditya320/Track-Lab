import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

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

    // Fetch current user role
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
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

    await prisma.user.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
  }
}
