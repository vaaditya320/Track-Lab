import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isAdmin } from "@/lib/isAdmin";

// GET all projects
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        leader: {
          select: { 
            name: true,
            batch: true 
          },
        },
      },
    });

    // await logAdminAction(
    //   `All projects fetched by admin ${session.user.name}`,
    //   LogType.OTHER,
    //   { adminEmail: session.user.email }
    // );

    return new Response(
      JSON.stringify(
        projects.map((project) => ({
          ...project,
          leaderName: project.leader.name,
          leaderBatch: project.leader.batch,
        }))
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

// POST create a new project
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
    
    // Get leader details for logging
    const leader = await prisma.user.findUnique({
      where: { id: body.leaderId },
      select: { name: true, email: true },
    });
    
    const newProject = await prisma.project.create({
      data: {
        title: body.title,
        teamMembers: JSON.stringify(body.teamMembers),
        components: body.components,
        summary: body.summary || null,
        projectPhoto: body.projectPhoto || null,
        leaderId: body.leaderId,
      },
    });

    // Log the admin action
    await logAdminAction(
      `Project created: ${newProject.title} (ID: ${newProject.id})`,
      LogType.PROJECT_CREATION,
      { projectId: newProject.id, projectTitle: newProject.title }
    );

    return new Response(JSON.stringify(newProject), { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

// PUT update an existing project
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
    const { id } = params;

    // Get project details before update for logging
    const projectBeforeUpdate = await prisma.project.findUnique({
      where: { id },
      select: { title: true, status: true },
    });

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        teamMembers: JSON.stringify(body.teamMembers),
        components: body.components,
        summary: body.summary || null,
        projectPhoto: body.projectPhoto || null,
        status: body.status || "PARTIAL",
      },
    });

    // Log the admin action
    await logAdminAction(
      `Project "${projectBeforeUpdate.title}" updated by admin ${session.user.name} (${session.user.email}). Status changed from ${projectBeforeUpdate.status} to ${body.status || "PARTIAL"}`,
      LogType.PROJECT_UPDATE,
      {
        adminEmail: session?.user?.email,
        projectId: id,
        previous: projectBeforeUpdate,
        next: { ...body, teamMembers: Array.isArray(body.teamMembers) ? body.teamMembers : undefined },
      }
    );

    return new Response(JSON.stringify(updatedProject), { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

// DELETE remove a project
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { id } = await params;
    
    // Get project details before deletion for logging
    const projectToDelete = await prisma.project.findUnique({
      where: { id },
      select: { title: true, status: true },
    });
    
    const deletedProject = await prisma.project.delete({
      where: { id },
    });

    // Log the admin action
    await logAdminAction(
      `Project "${projectToDelete.title}" (status: ${projectToDelete.status}) deleted by admin ${session.user.name} (${session.user.email})`,
      LogType.PROJECT_DELETION,
      { adminEmail: session?.user?.email, projectId: id, projectTitle: projectToDelete.title }
    );

    return new Response(JSON.stringify(deletedProject), { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
