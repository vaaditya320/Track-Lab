import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/isSuperAdmin";

const BRANCHES = ["CS", "CSR", "CSAI", "CSDS", "AIDS", "CSIOT", "EC"];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const BATCHES = [
  "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3",
  "D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3",
  "G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3",
];

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  // Check if user is super admin
  if (!session || !isSuperAdmin(session)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch user by ID
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Log the admin action
    await logAdminAction(
      `Admin ${session.user.name} (${session.user.email}) viewed user details for ${user.name} (${user.email}) (${user.role})`,
      LogType.USER_MANAGEMENT,
      { adminEmail: session.user.email, targetUserId: id }
    );

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || !isSuperAdmin(session)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const allowedRoles = ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"];
    const nextRole = body.role;
    const branch = body.branch?.trim() || null;
    const section = body.section?.trim() || null;
    const batch = body.batch?.trim() || null;

    if (!body.name || !body.email || !body.regId || !nextRole) {
      return new Response(
        JSON.stringify({ error: "name, email, regId and role are required" }),
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(nextRole)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400 });
    }

    if (branch && !BRANCHES.includes(branch)) {
      return new Response(JSON.stringify({ error: "Invalid branch" }), { status: 400 });
    }
    if (section && !SECTIONS.includes(section)) {
      return new Response(JSON.stringify({ error: "Invalid section" }), { status: 400 });
    }
    if (batch && !BATCHES.includes(batch)) {
      return new Response(JSON.stringify({ error: "Invalid batch" }), { status: 400 });
    }
    if (section && batch && !batch.startsWith(section)) {
      return new Response(
        JSON.stringify({ error: "Batch must belong to selected section" }),
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        regId: true,
        role: true,
        phoneNumber: true,
        branch: true,
        section: true,
        batch: true,
      },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const duplicateEmail = await prisma.user.findFirst({
      where: { email: body.email, id: { not: id } },
      select: { id: true },
    });
    if (duplicateEmail) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
    }

    const duplicateRegId = await prisma.user.findFirst({
      where: { regId: body.regId, id: { not: id } },
      select: { id: true },
    });
    if (duplicateRegId) {
      return new Response(JSON.stringify({ error: "Registration ID already in use" }), {
        status: 409,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name.trim(),
        email: body.email.trim(),
        regId: body.regId.trim(),
        role: nextRole,
        phoneNumber: body.phoneNumber?.trim() || null,
        branch,
        section,
        batch,
      },
    });

    await logAdminAction(
      `Admin ${session.user.name} (${session.user.email}) updated user ${existingUser.name} (${existingUser.email})`,
      LogType.USER_MANAGEMENT,
      {
        adminEmail: session.user.email,
        targetUserId: id,
        previous: existingUser,
        next: {
          name: updatedUser.name,
          email: updatedUser.email,
          regId: updatedUser.regId,
          role: updatedUser.role,
          phoneNumber: updatedUser.phoneNumber,
          branch: updatedUser.branch,
          section: updatedUser.section,
          batch: updatedUser.batch,
        },
      }
    );

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
