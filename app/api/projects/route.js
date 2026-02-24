import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { logAdminAction, LogType } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        leaderId: session.user.id
      },
      include: {
        leader: {
          select: {
            name: true,
            email: true,
            regId: true
          }
        }
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, teamMembers, components, assignedAdminId } = data;

    // Validate required fields
    if (!title || !teamMembers || !components) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        title,
        teamMembers,
        components,
        leaderId: session.user.id,
        assignedAdminId: assignedAdminId || null
      },
      include: {
        leader: {
          select: {
            name: true,
            email: true,
            regId: true
          }
        },
        assignedAdmin: {
          select: {
            name: true,
            email: true,
            regId: true
          }
        }
      }
    });

    await logAdminAction(
      `Project created by user ${session.user.name} (${session.user.email}): "${project.title}" (ID: ${project.id})`,
      LogType.PROJECT_CREATION,
      {
        userId: session.user.id,
        userEmail: session.user.email,
        projectId: project.id,
        projectTitle: project.title,
        assignedAdminId: assignedAdminId || null,
      }
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
