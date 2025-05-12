import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET_NAME = "cache-buster";

async function fetchImageFromS3(s3Key) {
  if (!s3Key) return null;
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });
    const { Body, ContentType } = await s3.send(command);
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return {
      base64: `data:${ContentType};base64,${buffer.toString("base64")}`,
      contentType: ContentType,
    };
  } catch (error) {
    return null;
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const achievements = await prisma.achievement.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch images from S3 and attach as base64
    const achievementsWithImages = await Promise.all(
      achievements.map(async (ach) => {
        let imageBase64 = null;
        if (ach.imageUrl) {
          const img = await fetchImageFromS3(ach.imageUrl);
          imageBase64 = img ? img.base64 : null;
        }
        return {
          ...ach,
          imageBase64,
        };
      })
    );

    return new Response(JSON.stringify(achievementsWithImages), { status: 200 });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
} 