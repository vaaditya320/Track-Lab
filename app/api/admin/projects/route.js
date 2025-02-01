import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Admin check middleware
async function isAdmin(session) {
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    throw new Error("Unauthorized");
  }
}

// GET all projects with leader's name
export async function GET(req) {
  const session = await getServerSession(authOptions);

  try {
    await isAdmin(session);

    const projects = await prisma.project.findMany({
      include: {
        leader: {
          select: {
            name: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify(projects.map(project => ({
        ...project,
        leaderName: project.leader.name, // Attach leader name to project
      }))),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

// POST create a new project
export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  try {
    await isAdmin(session);

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
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

// PUT update an existing project
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { id } = params;

  try {
    await isAdmin(session);

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        teamMembers: JSON.stringify(body.teamMembers),
        components: body.components,
        summary: body.summary || null,
        projectPhoto: body.projectPhoto || null,
        status: body.status || "PARTIAL", // Allow status change
      },
    });

    return new Response(JSON.stringify(updatedProject), { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

// DELETE remove a project
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  try {
    await isAdmin(session);

    const deletedProject = await prisma.project.delete({
      where: { id },
    });

    return new Response(JSON.stringify(deletedProject), { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

// CRUD operations for Users
// GET all users
export async function GET_USERS(req) {
  const session = await getServerSession(authOptions);

  try {
    await isAdmin(session);

    const users = await prisma.user.findMany();

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

// POST create a new user
export async function POST_USER(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  try {
    await isAdmin(session);

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        regId: body.regId,
        email: body.email,
      },
    });

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

// PUT update an existing user
export async function PUT_USER(req, { params }) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { id } = params;

  try {
    await isAdmin(session);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        regId: body.regId,
        email: body.email,
      },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

// DELETE remove a user
export async function DELETE_USER(req, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  try {
    await isAdmin(session);

    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return new Response(JSON.stringify(deletedUser), { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}
