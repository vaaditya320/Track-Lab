import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isAdmin } from "@/lib/isAdmin";

// GET all idealab projects
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const projects = await prisma.idealabProject.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    await logAdminAction(
      `All Idea Lab projects fetched by admin ${session.user.name}`,
      LogType.OTHER,
      { adminEmail: session.user.email }
    );

    return new Response(JSON.stringify(projects), { status: 200 });
  } catch (error) {
    console.error("Error fetching idealab projects:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

// POST create a new idealab project
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.githubLink) {
      return new Response(
        JSON.stringify({ error: "Name, description, and GitHub link are required" }),
        { status: 400 }
      );
    }

    const newProject = await prisma.idealabProject.create({
      data: {
        name: body.name,
        description: body.description,
        githubLink: body.githubLink,
        image: body.image || null,
      },
    });

    // Log the admin action
    await logAdminAction(
      `Idea Lab project created: ${newProject.name} (ID: ${newProject.id})`,
      LogType.PROJECT_CREATION,
      { projectId: newProject.id, projectName: newProject.name }
    );

    return new Response(JSON.stringify(newProject), { status: 201 });
  } catch (error) {
    console.error("Error creating idealab project:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
