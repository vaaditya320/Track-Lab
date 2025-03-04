import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  // Only allow admin with a specific email
  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id } = params;

    // Fetch user by ID
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
