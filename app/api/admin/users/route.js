import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/isSuperAdmin";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function buildWhere(url) {
  const search = (url.searchParams.get("search") || "").trim();
  const email = (url.searchParams.get("email") || "").trim();
  const role = (url.searchParams.get("role") || "").trim();

  const and = [];
  if (role === "ADMIN") {
    and.push({ role: { in: ["ADMIN", "SUPER_ADMIN"] } });
  } else if (role === "STUDENT" || role === "TEACHER" || role === "SUPER_ADMIN") {
    and.push({ role });
  }
  if (email.length >= 2) {
    and.push({
      email: { contains: email, mode: "insensitive" },
    });
  }
  if (search.length >= 2) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { regId: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

// GET users — paginated list (super admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    let take = parseInt(url.searchParams.get("take") || String(DEFAULT_PAGE_SIZE), 10);
    if (Number.isNaN(take) || take < 1) take = DEFAULT_PAGE_SIZE;
    take = Math.min(take, MAX_PAGE_SIZE);
    let skip = parseInt(url.searchParams.get("skip") || "0", 10);
    if (Number.isNaN(skip) || skip < 0) skip = 0;

    const where = buildWhere(url);

    const rows = await prisma.user.findMany({
      where,
      skip,
      take: take + 1,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        regId: true,
        role: true,
        branch: true,
        section: true,
        batch: true,
      },
    });

    const hasMore = rows.length > take;
    const items = hasMore ? rows.slice(0, take) : rows;

    if (skip === 0) {
      await logAdminAction(
        `User list fetched by admin ${session.user.name} (${items.length} row(s))`,
        LogType.USER_MANAGEMENT,
        { adminEmail: session.user.email }
      );
    }

    return NextResponse.json({ items, hasMore });
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
    
    // Check if user is super admin
    if (!session || !isSuperAdmin(session)) {
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
    if (!["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
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
      `User ${userToUpdate.name} (${userToUpdate.email}) role changed from ${userToUpdate.role} to ${role} by admin ${session.user.name} (${session.user.email})`,
      LogType.USER_MANAGEMENT,
      { adminEmail: session.user.email, targetUserId: userId, previousRole: userToUpdate.role, newRole: role }
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

  // Check if user is super admin
  if (!session || !isSuperAdmin(session)) {
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
      `User ${userToDelete.name} (${userToDelete.email}) (${userToDelete.role}) deleted by admin ${session.user.name} (${session.user.email})`,
      LogType.USER_MANAGEMENT,
      { adminEmail: session.user.email, targetUserId: id, role: userToDelete.role }
    );

    return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
  }
}
