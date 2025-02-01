import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  // Admin check: Only admin user can access
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const projectId = params.id;

    // Fetch project by ID and include the related leader (user) data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        leader: true, // Include leader (user) data
      },
    });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(project), { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  // Admin check: Only admin user can access
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { title, teamMembers, components, summary, status, projectPhoto } = await req.json();
    const projectId = params.id;

    // Update the project with new data
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        teamMembers,
        components,
        summary,
        status,
        projectPhoto,
      },
    });

    return new Response(JSON.stringify(updatedProject), { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return new Response(JSON.stringify({ error: "Failed to update project" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  // Admin check: Only admin user can access
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const projectId = params.id;

    // Delete project by ID
    await prisma.project.delete({
      where: { id: projectId },
    });

    return new Response(JSON.stringify({ message: "Project deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response(JSON.stringify({ error: "Failed to delete project" }), { status: 500 });
  }
}
