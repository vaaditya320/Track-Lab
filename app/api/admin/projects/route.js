import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";
import { isAdmin } from "@/lib/isAdmin";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function sessionToCreatedAtRange(session) {
  // Dates are inclusive start, exclusive end (UTC) to avoid TZ edge cases.
  // Sem 1: Aug 2025 → Jan 2026
  // Sem 2: Jan 2026 → Apr 2026
  if (session === "2025-2026-sem1") {
    return {
      gte: new Date(Date.UTC(2025, 7, 1, 0, 0, 0)),  // 2025-08-01
      lt: new Date(Date.UTC(2026, 1, 1, 0, 0, 0)),   // 2026-02-01
    };
  }
  if (session === "2025-2026-sem2") {
    return {
      gte: new Date(Date.UTC(2026, 0, 1, 0, 0, 0)),  // 2026-01-01
      lt: new Date(Date.UTC(2026, 4, 1, 0, 0, 0)),   // 2026-05-01
    };
  }
  return null;
}

function buildWhere(url) {
  const search = (url.searchParams.get("search") || "").trim();
  const status = (url.searchParams.get("status") || "").trim();
  const batch = (url.searchParams.get("batch") || "").trim();

  const and = [];
  if (status === "PARTIAL" || status === "SUBMITTED") {
    and.push({ status });
  }

  if (batch) and.push({ leader: { batch } });

  if (search.length > 0) {
    and.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { leader: { name: { contains: search, mode: "insensitive" } } },
        { leader: { regId: { contains: search, mode: "insensitive" } } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

async function getProjectIdsForSession(session) {
  const createdAt = sessionToCreatedAtRange(session);
  if (!createdAt) return null;

  const logs = await prisma.adminLog.findMany({
    where: {
      type: LogType.PROJECT_CREATION,
      createdAt,
    },
    select: {
      metadata: true,
    },
  });

  const ids = [];
  for (const log of logs) {
    const value = log?.metadata?.projectId;
    if (typeof value === "string" && value.length > 0) {
      ids.push(value);
    }
  }
  return ids;
}

// GET projects (paginated + server-side filters; default latest first by id)
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const url = new URL(req.url);
    let take = parseInt(url.searchParams.get("take") || String(DEFAULT_PAGE_SIZE), 10);
    if (Number.isNaN(take) || take < 1) take = DEFAULT_PAGE_SIZE;
    take = Math.min(take, MAX_PAGE_SIZE);
    let skip = parseInt(url.searchParams.get("skip") || "0", 10);
    if (Number.isNaN(skip) || skip < 0) skip = 0;

    const where = buildWhere(url);
    const session = (url.searchParams.get("session") || "").trim();
    const sessionProjectIds = await getProjectIdsForSession(session);
    if (Array.isArray(sessionProjectIds)) {
      if (sessionProjectIds.length === 0) {
        return new Response(JSON.stringify({ items: [], hasMore: false, totalCount: 0 }), { status: 200 });
      }
      if (!where.AND) where.AND = [];
      where.AND.push({ id: { in: sessionProjectIds } });
    }

    const rows = await prisma.project.findMany({
      where,
      skip,
      take: take + 1,
      orderBy: { id: "desc" },
      include: {
        leader: {
          select: {
            name: true,
            batch: true,
            regId: true,
          },
        },
      },
    });

    const hasMore = rows.length > take;
    const slice = hasMore ? rows.slice(0, take) : rows;
    const totalCount = await prisma.project.count({ where });
    const items = slice.map((project) => ({
      ...project,
      leaderName: project.leader.name,
      leaderBatch: project.leader.batch,
      leaderRegId: project.leader.regId,
    }));

    return new Response(JSON.stringify({ items, hasMore, totalCount }), { status: 200 });
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
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
    
    // Get leader details for logging
    const leader = await prisma.user.findUnique({
      where: { id: body.leaderId },
      select: { name: true, email: true },
    });
    
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

    // Log the admin action
    await logAdminAction(
      `Project created: ${newProject.title} (ID: ${newProject.id})`,
      LogType.PROJECT_CREATION,
      { projectId: newProject.id, projectTitle: newProject.title }
    );

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
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
    const { id } = params;

    // Get project details before update for logging
    const projectBeforeUpdate = await prisma.project.findUnique({
      where: { id },
      select: { title: true, status: true },
    });

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

    // Log the admin action
    await logAdminAction(
      `Project "${projectBeforeUpdate.title}" updated by admin ${session.user.name} (${session.user.email}). Status changed from ${projectBeforeUpdate.status} to ${body.status || "PARTIAL"}`,
      LogType.PROJECT_UPDATE,
      {
        adminEmail: session?.user?.email,
        projectId: id,
        previous: projectBeforeUpdate,
        next: { ...body, teamMembers: Array.isArray(body.teamMembers) ? body.teamMembers : undefined },
      }
    );

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
  if (!isAdmin(session)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const { id } = await params;
    
    // Get project details before deletion for logging
    const projectToDelete = await prisma.project.findUnique({
      where: { id },
      select: { title: true, status: true },
    });
    
    const deletedProject = await prisma.project.delete({
      where: { id },
    });

    // Log the admin action
    await logAdminAction(
      `Project "${projectToDelete.title}" (status: ${projectToDelete.status}) deleted by admin ${session.user.name} (${session.user.email})`,
      LogType.PROJECT_DELETION,
      { adminEmail: session?.user?.email, projectId: id, projectTitle: projectToDelete.title }
    );

    return new Response(JSON.stringify(deletedProject), { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
