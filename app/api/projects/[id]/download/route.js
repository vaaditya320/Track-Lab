import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import nodemailer from "nodemailer";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Function to generate PDF
async function generateProjectPDF(project) {
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
  const pdfPath = path.join("public", "reports", `Project-${project.id}.pdf`);
  await writeFile(pdfPath, pdfBytes);

  return pdfPath;
}

// Function to send email with PDF
async function sendEmailWithPDF(userEmail, pdfPath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",  // Replace with your email
      pass: "your-email-password",   // Replace with an app password
    },
  });

  await transporter.sendMail({
    from: "your-email@gmail.com",
    to: userEmail,
    subject: "Your Project Report",
    text: "Attached is your project report.",
    attachments: [{ filename: "Project-Report.pdf", path: pdfPath }],
  });

  await unlink(pdfPath); // Delete the file after sending
}

// API Route Handler
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id, leaderId: session.user.id },
    });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    const pdfPath = await generateProjectPDF(project);
    await sendEmailWithPDF(session.user.email, pdfPath);

    return new Response(JSON.stringify({ message: "PDF sent to your email" }), { status: 200 });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
