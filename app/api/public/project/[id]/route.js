import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

function toPublicProject(project) {
  let teamMembers = [];
  try {
    const parsed = JSON.parse(project.teamMembers);
    teamMembers = Array.isArray(parsed) ? parsed : [];
  } catch {
    teamMembers = [];
  }

  return {
    id: project.id,
    title: project.title,
    teamMembers,
    components: project.components,
    summary: project.summary,
    status: project.status,
    projectPhoto: project.projectPhoto,
    leader: project.leader
      ? { name: project.leader.name, regId: project.leader.regId }
      : null,
  };
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        teamMembers: true,
        components: true,
        summary: true,
        status: true,
        projectPhoto: true,
        leader: {
          select: {
            name: true,
            regId: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(toPublicProject(project), { status: 200 });
  } catch (error) {
    console.error("Error fetching public project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
