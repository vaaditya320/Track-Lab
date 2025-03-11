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
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Theme color - using proper rgb function from PDF-lib
    const themeColor = rgb(54/255, 78/255, 210/255);
    
    // Header with theme color background
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: themeColor
    });
    
    // Title text in white on the theme background
    page.drawText("PROJECT REPORT", {
      x: 50,
      y: height - 60,
      size: 28,
      font: boldFont,
      color: rgb(1, 1, 1) // White
    });
    
    let textY = height - 120;
    
    // Project Title
    page.drawText("Project Title:", {
      x: 50,
      y: textY,
      size: 14,
      font: boldFont,
      color: themeColor
    });
    
    textY -= 25;
    page.drawText(project.title, {
      x: 70,
      y: textY,
      size: 16,
      font: font,
      color: rgb(0, 0, 0)
    });
    
    // Leader Name
    textY -= 35;
    page.drawText("Project Leader:", {
      x: 50,
      y: textY,
      size: 14,
      font: boldFont,
      color: themeColor
    });
    
    textY -= 25;
    page.drawText(project.leader.name, {
      x: 70,
      y: textY,
      size: 14,
      font: font,
      color: rgb(0, 0, 0)
    });
    
    // Team Members in separate boxes
    textY -= 35;
    page.drawText("Team Members:", {
      x: 50,
      y: textY,
      size: 14,
      font: boldFont,
      color: themeColor
    });
    
    textY -= 25;
    // Parse team members
    const teamMembers = JSON.parse(project.teamMembers);
    const boxHeight = 30;
    const boxWidth = 150;
    const boxesPerRow = 3;
    const margin = 20;
    
    for (let i = 0; i < teamMembers.length; i++) {
      const row = Math.floor(i / boxesPerRow);
      const col = i % boxesPerRow;
      
      const boxX = 50 + col * (boxWidth + margin);
      const boxY = textY - row * (boxHeight + 10);
      
      // Draw box with theme color outline
      page.drawRectangle({
        x: boxX,
        y: boxY - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: themeColor,
        borderWidth: 1,
        color: rgb(0.95, 0.95, 1) // Very light blue background
      });
      
      // Draw member name in the box
      page.drawText(teamMembers[i], {
        x: boxX + 10,
        y: boxY - boxHeight/2 - 6,
        size: 12,
        font: font,
        color: rgb(0, 0, 0)
      });
    }
    
    // Calculate new Y position after team member boxes
    const rowsNeeded = Math.ceil(teamMembers.length / boxesPerRow);
    textY -= (rowsNeeded * (boxHeight + 10) + 20);
    
    // Project Status
    page.drawText("Project Status:", {
      x: 50,
      y: textY,
      size: 14,
      font: boldFont,
      color: themeColor
    });
    
    textY -= 25;
    
    // Status box with color based on status
    let statusColor = rgb(0.5, 0.5, 0.5); // Default gray
    if (project.status === "SUBMITTED") {
      statusColor = rgb(0, 0.7, 0); // Green for submitted
    } else if (project.status === "PARTIAL") {
      statusColor = rgb(1, 0.7, 0); // Orange for partial
    }
    
    // Draw status box
    page.drawRectangle({
      x: 70,
      y: textY - 25,
      width: 120,
      height: 30,
      color: statusColor,
      borderWidth: 0
    });
    
    // Draw status text
    page.drawText(project.status, {
      x: 80,
      y: textY - 10,
      size: 14,
      font: boldFont,
      color: rgb(1, 1, 1) // White text
    });
    
    textY -= 50;
    
    // Components
    page.drawText("Components:", {
      x: 50,
      y: textY,
      size: 14,
      font: boldFont,
      color: themeColor
    });
    
    textY -= 25;
    
    // Draw components in a box
    page.drawRectangle({
      x: 50,
      y: textY - 60,
      width: width - 100,
      height: 60,
      borderColor: themeColor,
      borderWidth: 1,
      color: rgb(0.95, 0.95, 1) // Very light blue background
    });
    
    // Draw components text with word wrapping
    const componentText = project.components || "No components specified";
    const words = componentText.split(' ');
    let line = '';
    let componentY = textY - 20;
    const maxLineWidth = width - 120;
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, 12);
      
      if (testWidth > maxLineWidth) {
        page.drawText(line, {
          x: 60,
          y: componentY,
          size: 12,
          font: font,
          color: rgb(0, 0, 0)
        });
        line = word;
        componentY -= 15;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      page.drawText(line, {
        x: 60,
        y: componentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0)
      });
    }
    
    textY -= 80;
    
    // Summary (only if status is SUBMITTED)
    if (project.status === "SUBMITTED") {
      page.drawText("Project Summary:", {
        x: 50,
        y: textY,
        size: 14,
        font: boldFont,
        color: themeColor
      });
      
      textY -= 25;
      
      // Draw summary in a box
      page.drawRectangle({
        x: 50,
        y: textY - 100,
        width: width - 100,
        height: 100,
        borderColor: themeColor,
        borderWidth: 1,
        color: rgb(0.95, 0.95, 1) // Very light blue background
      });
      
      // Draw summary text with word wrapping
      const summaryText = project.summary || "No summary provided";
      const summaryWords = summaryText.split(' ');
      let summaryLine = '';
      let summaryY = textY - 20;
      
      for (const word of summaryWords) {
        const testLine = summaryLine + (summaryLine ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, 12);
        
        if (testWidth > maxLineWidth) {
          page.drawText(summaryLine, {
            x: 60,
            y: summaryY,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
          });
          summaryLine = word;
          summaryY -= 15;
        } else {
          summaryLine = testLine;
        }
      }
      
      if (summaryLine) {
        page.drawText(summaryLine, {
          x: 60,
          y: summaryY,
          size: 12,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      textY -= 120;
    }
    
    // Add a decorative footer with theme color
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 30,
      color: themeColor
    });
    
    // Embed Image if available (for SUBMITTED projects)
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
          const maxImgWidth = width - 200;
          const maxImgHeight = 150;
          const imgDims = image.scaleToFit(maxImgWidth, maxImgHeight);
          const imgX = (width - imgDims.width) / 2;
          const imgY = 50;
          
          // Add a border around the image
          page.drawRectangle({
            x: imgX - 5,
            y: imgY - 5,
            width: imgDims.width + 10,
            height: imgDims.height + 10,
            borderColor: themeColor,
            borderWidth: 2,
            color: rgb(1, 1, 1) // White background
          });
          
          page.drawImage(image, {
            x: imgX,
            y: imgY,
            width: imgDims.width,
            height: imgDims.height
          });
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
