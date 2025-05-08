import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow teachers to access their assigned projects
    if (user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can view assigned projects" }, { status: 403 });
    }

    // Fetch projects assigned to this teacher
    const projects = await prisma.project.findMany({
      where: {
        assignedTeacherId: session.user.id
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
            regId: true
          }
        }
      }
    });

    // Parse team members from JSON string, with error handling
    const projectsWithParsedTeamMembers = projects.map(project => {
      try {
        let parsedTeamMembers;
        if (typeof project.teamMembers === 'string') {
          try {
            // First try parsing as JSON
            parsedTeamMembers = JSON.parse(project.teamMembers);
          } catch {
            // If JSON parsing fails, try splitting by comma
            parsedTeamMembers = project.teamMembers.split(',').map(member => member.trim());
          }
        } else {
          parsedTeamMembers = project.teamMembers;
        }

        return {
          ...project,
          teamMembers: parsedTeamMembers
        };
      } catch (error) {
        console.error(`Error parsing team members for project ${project.id}:`, error);
        return {
          ...project,
          teamMembers: []
        };
      }
    });

    return NextResponse.json(projectsWithParsedTeamMembers);
  } catch (error) {
    console.error("Error in /api/projects/assigned:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned projects", details: error.message },
      { status: 500 }
    );
  }
} 