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

    // Require role parameter
    if (!role) {
      return NextResponse.json(
        { error: "Role parameter is required" },
        { status: 400 }
      );
    }

    // Only allow specific roles: TEACHER and admin
    if (role !== "TEACHER" && role !== "admin") {
      return NextResponse.json(
        { error: "Invalid role. Only 'TEACHER' and 'admin' roles are allowed" },
        { status: 400 }
      );
    }

    let users;
    if (role === "admin") {
      // Return admins and super admins
      users = await prisma.user.findMany({
        where: {
          role: {
            in: ["ADMIN", "SUPER_ADMIN"]
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          regId: true,
          role: true,
          phoneNumber: true
        }
      });
    } else if (role === "TEACHER") {
      // Return only teachers
      users = await prisma.user.findMany({
        where: {
          role: "TEACHER"
        },
        select: {
          id: true,
          name: true,
          email: true,
          regId: true,
          role: true,
          phoneNumber: true
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