import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { branch, section, batch, phoneNumber } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { branch, section, batch, phoneNumber },
    });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update user info" }), { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      regId: true,
      email: true,
      phoneNumber: true,
      branch: true,
      section: true,
      batch: true,
      role: true,
    },
  });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  return new Response(JSON.stringify(user), { status: 200 });
} 