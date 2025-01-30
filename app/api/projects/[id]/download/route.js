import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import nodemailer from "nodemailer";
import { writeFile, unlink } from "fs/promises"; // Async file operations
import fs from "fs"; // Synchronous file operations
import path from "path";

const prisma = new PrismaClient();

// Function to generate PDF with project details and photo (if applicable)
async function generateProjectPDF(project, leaderName) {
  try {
    // Ensure the "reports" directory exists
    const reportsDir = path.join(process.cwd(), "public", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("Project Report", { x: 50, y: height - 50, size: 20, font, color: rgb(0, 0, 0) });
    page.drawText(`Title: ${project.title}`, { x: 50, y: height - 80, size: 14, font });
    page.drawText(`Leader: ${leaderName}`, { x: 50, y: height - 110, size: 14, font });
    page.drawText(`Team Members: ${JSON.parse(project.teamMembers).join(", ")}`, { x: 50, y: height - 140, size: 14, font });

    if (project.status === "SUBMITTED") {
      page.drawText(`Summary: ${project.summary}`, { x: 50, y: height - 180, size: 12, font });
      page.drawText(`Components: ${project.components}`, { x: 50, y: height - 210, size: 12, font });

      // If project photo exists, embed it in the PDF
      if (project.projectPhoto) {
        const imagePath = path.join(process.cwd(), "public/uploads", project.projectPhoto);
        if (fs.existsSync(imagePath)) {
          const imageBytes = fs.readFileSync(imagePath);
          let image;
          if (project.projectPhoto.endsWith(".png")) {
            image = await pdfDoc.embedPng(imageBytes);
          } else if (project.projectPhoto.endsWith(".jpg") || project.projectPhoto.endsWith(".jpeg")) {
            image = await pdfDoc.embedJpg(imageBytes);
          }

          if (image) {
            const imgDims = image.scale(0.5);
            page.drawImage(image, {
              x: 50,
              y: height - 400,
              width: imgDims.width,
              height: imgDims.height,
            });
          }
        }
      }
    } else {
      page.drawText("Status: Partial (More details required)", { x: 50, y: height - 180, size: 12, font });
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

// Function to send email with attached PDF
async function sendEmailWithPDF(userEmail, pdfPath) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vaaditya320@gmail.com",  // Replace with your email
        pass: process.env.GMAIL_APP_PASSWORD,  // Use an app password from Google
      },
    });

    await transporter.sendMail({
      from: "vaaditya320@gmail.com",
      to: userEmail,
      subject: "Your Project Report",
      text: "Attached is your project report.",
      attachments: [{ filename: "Project-Report.pdf", path: pdfPath }],
    });

    await unlink(pdfPath); // Delete the file after sending
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email sending failed");
  }
}

// API Route Handler
export async function GET(req, context) {
  try {
    const { id } = context.params; // Ensure params are accessed safely

    if (!id) {
      return new Response(JSON.stringify({ error: "Invalid project ID" }), { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id, leaderId: session.user.id },
    });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    const leaderName = session.user.name;
    const pdfPath = await generateProjectPDF(project, leaderName);
    await sendEmailWithPDF(session.user.email, pdfPath);

    return new Response(JSON.stringify({ message: "PDF sent to your email" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
