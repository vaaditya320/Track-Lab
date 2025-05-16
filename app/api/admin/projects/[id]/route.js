import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
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
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { title, teamMembers, components, summary, status, projectPhoto } = await req.json();
    const projectId = params.id;

    // Get project details before update for logging
    const projectBeforeUpdate = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, status: true },
    });

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

    // Log the admin action
    await logAdminAction(
      `Project updated: ${updatedProject.title} (ID: ${projectId})`,
      LogType.PROJECT_UPDATE,
      { projectId: projectId, projectTitle: updatedProject.title, changes: { title, teamMembers, components, summary, status, projectPhoto } }
    );

    return new Response(JSON.stringify(updatedProject), { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return new Response(JSON.stringify({ error: "Failed to update project" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const projectId = params.id;

    // Get project details before deletion for logging
    const projectToDelete = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, status: true },
    });

    if (!projectToDelete) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    // Delete project by ID
    await prisma.project.delete({
      where: { id: projectId },
    });

    // Log the admin action
    await logAdminAction(
      `Project deleted: ${projectToDelete.title} (ID: ${projectId})`,
      LogType.PROJECT_DELETION,
      { projectId: projectId, projectTitle: projectToDelete.title }
    );

    return new Response(JSON.stringify({ message: "Project deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response(JSON.stringify({ error: "Failed to delete project" }), { status: 500 });
  }
}
