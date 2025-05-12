import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET_NAME = "cache-buster";
const FOLDER_NAME = "tracklab-achievements/";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Get user details to get regId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { regId: true }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const type = formData.get("type");
    const file = formData.get("image");

    if (!title || !description || !type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    if (type !== "STUDENT" && type !== "FACULTY") {
      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
    }

    let imageUrl = null;
    if (file && file.name) {
      const fileExtension = file.name.split('.').pop();
      const uniqueName = `${user.regId}-${Date.now()}.${fileExtension}`;
      const s3Key = `${FOLDER_NAME}${uniqueName}`;
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      };
      await s3.send(new PutObjectCommand(uploadParams));
      imageUrl = s3Key;
    }

    // Create achievement in DB
    const achievement = await prisma.achievement.create({
      data: {
        title,
        description,
        imageUrl,
        type,
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify(achievement), { status: 201 });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
} 