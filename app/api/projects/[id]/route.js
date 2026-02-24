import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { logAdminAction, LogType } from "@/lib/logger";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { leader: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const existing = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        components: true,
        teamMembers: true,
        status: true,
        leaderId: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existing.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "PARTIAL") {
      return NextResponse.json(
        { error: "Only projects in PARTIAL state can be edited" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, teamMembers, components } = body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        components: components ?? existing.components,
        teamMembers:
          typeof teamMembers === "string"
            ? teamMembers
            : teamMembers
            ? JSON.stringify(teamMembers)
            : existing.teamMembers,
      },
    });

    await logAdminAction(
      `User ${session.user.name} (${session.user.email}) updated their project "${updated.title}" (ID: ${updated.id}) while in PARTIAL state`,
      LogType.PROJECT_UPDATE,
      {
        userId: session.user.id,
        userEmail: session.user.email,
        projectId: updated.id,
        before: existing,
        after: {
          title: updated.title,
          components: updated.components,
          teamMembers: updated.teamMembers,
        },
      }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        leaderId: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Ensure the project is owned by the session user
    if (project.leaderId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id },
    });

    await logAdminAction(
      `User ${session.user.name} (${session.user.email}) deleted their own project "${project.title}" (ID: ${id})`,
      LogType.PROJECT_DELETION,
      {
        userId,
        userEmail: session.user.email,
        projectId: id,
        projectTitle: project.title,
      }
    );

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
