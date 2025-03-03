import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Admin check middleware
async function isAdmin(session) {
  if (!session || !session.user || !session.user.email) return false;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

// GET all projects
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!(await isAdmin(session))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        leader: {
          select: { name: true },
        },
      },
    });

    return new Response(
      JSON.stringify(
        projects.map((project) => ({
          ...project,
          leaderName: project.leader.name,
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
  if (!(await isAdmin(session))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
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
  if (!(await isAdmin(session))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
    const { id } = params;

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
  if (!(await isAdmin(session))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { id } = await params;
    const deletedProject = await prisma.project.delete({
      where: { id },
    });

    return new Response(JSON.stringify(deletedProject), { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
