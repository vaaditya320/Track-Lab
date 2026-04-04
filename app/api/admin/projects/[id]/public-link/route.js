import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const base = (process.env.BASE_URL || "").replace(/\/$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "BASE_URL is not configured in the environment" },
        { status: 500 }
      );
    }

    const publicUrl = `${base}/public/project/${id}`;
    return NextResponse.json({ publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error building public project link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
