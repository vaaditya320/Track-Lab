import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import nodemailer from "nodemailer";
import { writeFile, unlink } from "fs/promises"; // Keep these as promises for writing/deleting files
import fs from "fs"; // Import fs to handle existsSync
import path from "path";

const prisma = new PrismaClient();

// Function to generate PDF
async function generateProjectPDF(project) {
  try {
    // Ensure the "reports" directory exists
    const reportsDir = path.join("public", "reports");
    if (!fs.existsSync(reportsDir)) { // Use fs here for existsSync
      fs.mkdirSync(reportsDir, { recursive: true }); // Ensure the directory is created if not existing
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("Project Report", { x: 50, y: height - 50, size: 20, font, color: rgb(0, 0, 0) });
    page.drawText(`Title: ${project.title}`, { x: 50, y: height - 80, size: 14, font });
    page.drawText(`Leader: ${project.leaderId}`, { x: 50, y: height - 110, size: 14, font });
    page.drawText(`Team Members: ${JSON.parse(project.teamMembers).join(", ")}`, { x: 50, y: height - 140, size: 14, font });

    if (project.status === "SUBMITTED") {
      page.drawText(`Summary: ${project.summary}`, { x: 50, y: height - 180, size: 12, font });
      page.drawText(`Components: ${project.components}`, { x: 50, y: height - 210, size: 12, font });
    } else {
      page.drawText("Status: Partial (More details required)", { x: 50, y: height - 180, size: 12, font });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(reportsDir, `Project-${project.id}.pdf`);
    await writeFile(pdfPath, pdfBytes);

    return pdfPath;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("PDF generation failed");
  }
}

// Function to send email with PDF
async function sendEmailWithPDF(userEmail, pdfPath) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vaaditya320@gmail.com",  // Replace with your email
        pass: process.env.GMAIL_APP_PASSWORD,  // Replace with an app password
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
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
}

// API Route Handler
export async function GET(req, { params }) {
  const { id } = params;  // Destructure params to get the id

  const session = await getServerSession(authOptions);

  if (!session) {
    console.error("Unauthorized access");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id, leaderId: session.user.id },
    });

    if (!project) {
      console.error(`Project with ID ${id} not found`);
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    const pdfPath = await generateProjectPDF(project);
    await sendEmailWithPDF(session.user.email, pdfPath);

    return new Response(JSON.stringify({ message: "PDF sent to your email" }), { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
