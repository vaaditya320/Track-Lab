import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// AWS S3 Configuration
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = "cache-buster";
const FOLDER_NAME = "tracklab-project-pics/";

export async function POST(req, { params }) {
  try {
    const projectId = await params.id;
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const formData = await req.formData();
    const summary = formData.get("summary");
    const file = formData.get("photo");

    if (!summary) {
      return NextResponse.json({ error: "Summary is required" }, { status: 400 });
    }

    let photoFilename = null;

    if (file && file.name) {
      const uniqueName = `${Date.now()}-${file.name}`;
      const s3Key = `${FOLDER_NAME}${uniqueName}`;

      // Upload file to S3
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));
      photoFilename = s3Key;
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update project in DB
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        summary,
        projectPhoto: photoFilename || existingProject.projectPhoto,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(updatedProject, { status: 200 });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
