import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import nodemailer from "nodemailer";
import { writeFile, unlink } from "fs/promises";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// AWS S3 Configuration
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Constants
const BUCKET_NAME = "cache-buster";

// Fetch image from S3
async function fetchImageFromS3(s3Key) {
  try {
    if (!s3Key) throw new Error("S3 key is missing");

    console.log(`Fetching image from S3: ${s3Key}`);

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const { Body, ContentType } = await s3.send(command);

    console.log("Fetched image content type:", ContentType);

    return new Promise((resolve, reject) => {
      const chunks = [];
      Body.on("data", (chunk) => chunks.push(chunk));
      Body.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: ContentType }));
      Body.on("error", reject);
    });
  } catch (error) {
    console.error("❌ Error fetching image from S3:", error);
    throw new Error("Failed to fetch project image from S3");
  }
}

// Generate PDF
async function generateProjectPDF(project, leaderName) {
  try {
    const reportsDir = path.join(process.cwd(), "public", "reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let textY = height - 50;
    page.drawText("Project Report", { x: 50, y: textY, size: 20, font, color: rgb(0, 0, 0) });
    textY -= 30;

    const details = [
      `Title: ${project.title}`,
      `Leader: ${leaderName}`,
      `Team Members: ${JSON.parse(project.teamMembers).join(", ")}`,
      `Status: ${project.status}`,
    ];

    if (project.status === "SUBMITTED") {
      details.push(`Summary: ${project.summary}`, `Components: ${project.components}`);
    } else {
      details.push("Status: Partial (More details required)");
    }

    const lineHeight = 16;
    for (const line of details) {
      page.drawText(line, { x: 50, y: textY, size: 12, font });
      textY -= lineHeight;
    }

    // Embed Image if available
    if (project.status === "SUBMITTED" && project.projectPhoto) {
      try {
        const { buffer: imageBuffer, contentType } = await fetchImageFromS3(project.projectPhoto);
        console.log("Fetched image buffer size:", imageBuffer.length);

        let image;
        if (contentType === "image/png") {
          image = await pdfDoc.embedPng(imageBuffer);
        } else if (contentType === "image/jpeg" || contentType === "image/jpg") {
          image = await pdfDoc.embedJpg(imageBuffer);
        } else {
          console.error("❌ Unsupported image format:", contentType);
        }

        if (image) {
          const maxImgWidth = width - 100;
          const maxImgHeight = height / 3;
          const imgDims = image.scaleToFit(maxImgWidth, maxImgHeight);

          const imgX = (width - imgDims.width) / 2;
          const imgY = 50;
          page.drawImage(image, { x: imgX, y: imgY, width: imgDims.width, height: imgDims.height });
        } else {
          console.error("❌ Failed to embed image into PDF");
        }
      } catch (error) {
        console.error("❌ Error embedding image:", error);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(reportsDir, `Project-${project.id}.pdf`);
    await writeFile(pdfPath, pdfBytes);

    return pdfPath;
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw new Error("PDF generation failed");
  }
}

// Send email with PDF
async function sendEmailWithPDF(userEmail, pdfPath) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vaaditya320@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "vaaditya320@gmail.com",
      to: userEmail,
      subject: "Your Project Report",
      text: "Attached is your project report.",
      attachments: [{ filename: "Project-Report.pdf", path: pdfPath }],
    });

    await unlink(pdfPath);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email sending failed");
  }
}

// API Route
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: "Invalid project ID" }), { status: 400 });

    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id, leaderId: session.user.id },
    });

    if (!project) return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });

    const leaderName = session.user.name;
    const pdfPath = await generateProjectPDF(project, leaderName);
    await sendEmailWithPDF(session.user.email, pdfPath);

    return new Response(JSON.stringify({ message: "PDF sent to your email" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
