import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    if (q.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const take = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 20;

    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        id: { not: session.user.id },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { regId: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        regId: true,
      },
      take,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
