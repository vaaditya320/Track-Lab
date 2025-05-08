import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the role query parameter
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let users;
    if (role) {
      // If role is specified, fetch users with that role
      users = await prisma.user.findMany({
        where: {
          role: role
        },
        select: {
          id: true,
          name: true,
          email: true,
          regId: true,
          role: true
        }
      });
    } else {
      // If no role specified, fetch all users
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          regId: true,
          role: true
        }
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 