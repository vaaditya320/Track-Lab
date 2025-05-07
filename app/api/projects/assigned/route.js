import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        assignedAdminId: session.user.id
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

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned projects" },
      { status: 500 }
    );
  }
} 