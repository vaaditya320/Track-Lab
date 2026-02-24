import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isAdmin } from "@/lib/isAdmin";

// DELETE remove an idealab project
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { id } = await params;
    
    // Get project details before deletion for logging
    const projectToDelete = await prisma.idealabProject.findUnique({
      where: { id },
      select: { name: true, githubLink: true },
    });

    if (!projectToDelete) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404 }
      );
    }
    
    const deletedProject = await prisma.idealabProject.delete({
      where: { id },
    });

    // Log the admin action
    await logAdminAction(
      `Idea Lab project "${projectToDelete.name}" deleted by admin ${session.user.name} (${session.user.email})`,
      LogType.PROJECT_DELETION,
      { adminEmail: session?.user?.email, projectId: id, projectName: projectToDelete.name }
    );

    return new Response(JSON.stringify(deletedProject), { status: 200 });
  } catch (error) {
    console.error("Error deleting idealab project:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
