import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAdminAction, LogType } from "@/lib/logger";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the request comes from the specific authorized email
    if (session.user.email !== "2023pietcsaaditya003@poornima.org") {
      return NextResponse.json({ error: "Forbidden - Access denied" }, { status: 403 });
    }

    const { id } = params;

    // Fetch user details before update for logging
    const userToPromote = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true,
        email: true, 
        role: true, 
        name: true 
      },
    });

    if (!userToPromote) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already a super admin
    if (userToPromote.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "User is already a super admin" },
        { status: 400 }
      );
    }

    // Update user role to SUPER_ADMIN
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: "SUPER_ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        regId: true,
        role: true
      }
    });

    // Log the admin action
    await logAdminAction(
      `User ${userToPromote.name} (${userToPromote.email}) promoted from ${userToPromote.role} to SUPER_ADMIN by ${session.user.name} (${session.user.email})`,
      LogType.OTHER,
      { 
        adminEmail: session.user.email,
        targetUserId: id,
        previousRole: userToPromote.role,
        newRole: "SUPER_ADMIN"
      }
    );

    return NextResponse.json({
      message: "User promoted to super admin successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
