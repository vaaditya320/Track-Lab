import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.email !== "2023pietcsaaditya003@poornima.org") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany();
    return new Response(JSON.stringify(projects), { status: 200 });
  } catch (error) {
    console.error("Error fetching admin projects:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
