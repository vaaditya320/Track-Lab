import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/isSuperAdmin";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  // Check if user is super admin
  if (!session || !isSuperAdmin(session)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id } = params;

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
