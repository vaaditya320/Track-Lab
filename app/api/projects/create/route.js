import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { title, teamMembers, components, assignedTeacherId } = await req.json();

    if (!title || !teamMembers || !components) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Convert teamMembers string to array if it's a string
    const teamMembersArray = typeof teamMembers === 'string' 
      ? teamMembers.split(',').map(member => member.trim())
      : teamMembers;

    const project = await prisma.project.create({
      data: {
        title,
        leaderId: session.user.id,
        teamMembers: JSON.stringify(teamMembersArray),
        components,
        assignedTeacherId: assignedTeacherId || null,
      },
    });

    return new Response(JSON.stringify({ message: "Project created", project }), { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
