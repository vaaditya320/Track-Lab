import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import nodemailer from "nodemailer";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = "cache-buster";
const FOLDER_NAME = "tracklab-project-reports/";

const prisma = new PrismaClient();

// Check if PDF exists in S3
async function checkIfPdfExists(s3Key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));
    return true;
  } catch (error) {
    if (error.name === "NotFound") return false;
    console.error("Error checking PDF in S3:", error);
    throw new Error("Failed to check PDF existence");
  }
}

// Fetch PDF from S3
async function fetchPdfFromS3(s3Key) {
  try {
    const { Body } = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));

    return new Promise((resolve, reject) => {
      const chunks = [];
      Body.on("data", (chunk) => chunks.push(chunk));
      Body.on("end", () => resolve(Buffer.concat(chunks)));
      Body.on("error", reject);
    });
  } catch (error) {
    console.error("Error fetching PDF from S3:", error);
    throw new Error("Failed to fetch PDF from S3");
  }
}

// Fetch project image from S3
async function fetchImageFromS3(s3Key) {
  try {
    if (!s3Key) throw new Error("S3 key is missing");

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const { Body, ContentType } = await s3.send(command);

    return new Promise((resolve, reject) => {
      const chunks = [];
      Body.on("data", (chunk) => chunks.push(chunk));
      Body.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: ContentType }));
      Body.on("error", reject);
    });
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    throw new Error("Failed to fetch project image from S3");
  }
}

// Generate PDF and upload to S3
async function generateAndUploadPDF(project, leaderName) {
  try {
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
        let image;
        if (contentType === "image/png") {
          image = await pdfDoc.embedPng(imageBuffer);
        } else if (contentType === "image/jpeg" || contentType === "image/jpg") {
          image = await pdfDoc.embedJpg(imageBuffer);
        }

        if (image) {
          const maxImgWidth = width - 100;
          const maxImgHeight = height / 3;
          const imgDims = image.scaleToFit(maxImgWidth, maxImgHeight);
          const imgX = (width - imgDims.width) / 2;
          const imgY = 50;
          page.drawImage(image, { x: imgX, y: imgY, width: imgDims.width, height: imgDims.height });
        }
      } catch (error) {
        console.error("Error embedding image:", error);
      }
    }

    // Save PDF in memory and upload to S3
    const pdfBytes = await pdfDoc.save();
    const s3Key = `${FOLDER_NAME}${leaderName.replace(/\s+/g, "_")}-${project.status}-project-${project.id}.pdf`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(pdfBytes),
      ContentType: "application/pdf",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return s3Key;
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    throw new Error("Failed to generate or upload PDF");
  }
}

// Send email with PDF attachment
async function sendEmailWithPDF(userEmail, pdfBuffer, s3Key) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "Your Project Report",
      text: "Please find your project report attached.",
      attachments: [
        {
          filename: `${s3Key.split("/").pop()}`,
          content: pdfBuffer,
          encoding: "base64",
        },
      ],
    });

    console.log("Email sent with PDF attachment");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

// Fetch project details including status
async function fetchProjectDetails(projectId) {
  const response = await fetch(`${process.env.BASE_URL}/api/projects/${projectId}`);
  if (!response.ok) throw new Error("Failed to fetch project details");
  return response.json();
}

// API Route
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: "Invalid project ID" }), { status: 400 });

    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const project = await fetchProjectDetails(id);
    if (!project) return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });

    const leaderName = project.leader.name;
    const s3Key = `${FOLDER_NAME}${leaderName.replace(/\s+/g, "_")}-${project.status}-project-${project.id}.pdf`;

    let pdfBuffer;

    if (await checkIfPdfExists(s3Key)) {
      console.log("PDF already exists. Fetching from S3...");
      pdfBuffer = await fetchPdfFromS3(s3Key);
    } else {
      console.log("PDF not found. Generating new PDF...");
      await generateAndUploadPDF(project, leaderName);
      pdfBuffer = await fetchPdfFromS3(s3Key);
    }

    await sendEmailWithPDF(session.user.email, pdfBuffer, s3Key);

    return new Response(JSON.stringify({ message: "PDF sent to your email" }), { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
