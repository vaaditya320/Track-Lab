import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, components, assignedTeacherId, teamMemberIds } = body;

    if (!title || components === undefined || components === null) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    if (!Array.isArray(teamMemberIds)) {
      return new Response(
        JSON.stringify({ error: "teamMemberIds must be an array of user ids" }),
        { status: 400 }
      );
    }

    const rawIds = teamMemberIds.filter(
      (x) => typeof x === "string" && x.length > 0
    );
    const uniqueIds = [...new Set(rawIds)];
    if (uniqueIds.length !== rawIds.length) {
      return new Response(JSON.stringify({ error: "Duplicate team member ids" }), { status: 400 });
    }

    for (const uid of uniqueIds) {
      if (uid === session.user.id) {
        return new Response(
          JSON.stringify({ error: "You cannot add yourself as a team member" }),
          { status: 400 }
        );
      }
    }

    let memberUsers = [];
    if (uniqueIds.length > 0) {
      memberUsers = await prisma.user.findMany({
        where: {
          id: { in: uniqueIds },
          role: "STUDENT",
        },
        select: { id: true, name: true, regId: true },
      });

      if (memberUsers.length !== uniqueIds.length) {
        return new Response(
          JSON.stringify({
            error: "One or more team members are invalid or not registered students",
          }),
          { status: 400 }
        );
      }
    }

    const teamMembersJson = JSON.stringify(
      memberUsers.map((u) => `${u.name} (${u.regId})`)
    );

    const componentsStr =
      typeof components === "string" ? components : String(components);

    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: {
          title,
          leaderId: session.user.id,
          teamMembers: teamMembersJson,
          components: componentsStr,
          assignedTeacherId: assignedTeacherId || null,
        },
      });

      if (uniqueIds.length > 0) {
        await tx.projectMember.createMany({
          data: uniqueIds.map((userId) => ({
            projectId: p.id,
            userId,
          })),
        });
      }

      return p;
    });

    await logAdminAction(
      `Project created via /api/projects/create by user ${session.user.name} (${session.user.email}): "${project.title}" (ID: ${project.id})`,
      LogType.PROJECT_CREATION,
      {
        userId: session.user.id,
        userEmail: session.user.email,
        projectId: project.id,
        projectTitle: project.title,
        assignedTeacherId: assignedTeacherId || null,
      }
    );

    return new Response(JSON.stringify({ message: "Project created", project }), { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
