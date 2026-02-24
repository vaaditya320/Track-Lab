import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing achievement ID" }), { status: 400 });
  }
  try {
    await prisma.achievement.delete({ where: { id } });

    await logAdminAction(
      `Achievement deleted (ID: ${id}) by admin ${session.user.name} (${session.user.email})`,
      LogType.OTHER,
      { adminEmail: session.user.email, achievementId: id }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Not found or already deleted" }), { status: 404 });
  }
} 