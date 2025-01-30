import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { upload } from "../../../../lib/upload";
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const formData = await req.formData();
    const summary = formData.get("summary");
    const file = formData.get("projectPhoto");

    if (!summary || !file) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Ensure the file is an image
    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Invalid file type" }), { status: 400 });
    }

    // Read file as a buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = `public/uploads/${Date.now()}-${file.name}`;
    await writeFile(filePath, buffer);

    // Update the project in the database
    const project = await prisma.project.update({
      where: { id: params.id, leaderId: session.user.id },
      data: {
        summary,
        projectPhoto: filePath.replace("public/", ""), // Store relative path
        status: "SUBMITTED",
      },
    });

    return new Response(JSON.stringify({ message: "Project completed", project }), { status: 200 });
  } catch (error) {
    console.error("Error completing project:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
