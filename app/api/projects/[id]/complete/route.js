import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function POST(req, { params }) {
  try {
    const projectId = params.id; // Extract project ID
    const formData = await req.formData(); // Parse form data

    const summary = formData.get("summary");
    const file = formData.get("photo");

    if (!summary) {
      return NextResponse.json({ error: "Summary is required" }, { status: 400 });
    }

    let photoFilename = null;

    if (file && file.name) {
      // Save the uploaded photo
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      const uniqueName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadsDir, uniqueName);

      await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      photoFilename = uniqueName; // Store filename for DB
    }

    console.log("🔍 Checking if project exists in DB...");
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      console.error("❌ Project not found!");
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log("✅ Project found. Updating...");
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        summary,
        projectPhoto: photoFilename || existingProject.projectPhoto, // Preserve existing photo if not updated
        status: "SUBMITTED",
      },
    });

    console.log("✅ Project updated successfully:", updatedProject);
    return NextResponse.json(updatedProject, { status: 200 });

  } catch (error) {
    console.error("❌ Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Close Prisma connection
  }
}
