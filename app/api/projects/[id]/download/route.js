import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
async function generateAndUploadPDF(project, leaderName, sessionUser) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Theme color and style
    const themeColor = rgb(54/255, 78/255, 210/255);
    const lightThemeColor = rgb(0.95, 0.95, 1);
    const accentColor = rgb(0.8, 0.87, 1);
    const headerGradient = themeColor;
    const marginX = 50;
    const marginY = 40;
    const sectionTitleBoxColor = rgb(0.92, 0.96, 1);
    const sectionTitleBorderColor = themeColor;
    const sectionTitleTextColor = themeColor;
    const sectionTitleShadow = rgb(0.8, 0.85, 1);
    
    // Header with theme color background and shadow
    page.drawRectangle({
      x: 0,
      y: height - 90,
      width: width,
      height: 90,
      color: headerGradient
    });
    // Decorative shadow under header
    page.drawRectangle({
      x: 0,
      y: height - 92,
      width: width,
      height: 4,
      color: rgb(0.7, 0.7, 0.9)
    });
    // Title text in white on the theme background
    page.drawText("PROJECT REPORT", {
      x: marginX,
      y: height - 50,
      size: 30,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    // Top-right: Batch / Branch / Cohort
    const userBatch = sessionUser?.batch || "";
    const userBranch = sessionUser?.branch || "";
    const userEmail = sessionUser?.email || "";
    const cohort = userEmail ? userEmail.slice(0, 4) : "";
    const metaFontSize = 11;
    const rightColumnX = width - marginX - 200;
    const headerTextY = height - 40;
    page.drawText(`Batch: ${userBatch || "-"}`, {
      x: rightColumnX,
      y: headerTextY,
      size: metaFontSize,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    page.drawText(`Branch: ${userBranch || "-"}`, {
      x: rightColumnX,
      y: headerTextY - 16,
      size: metaFontSize,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    page.drawText(`Cohort: ${cohort || "-"}`, {
      x: rightColumnX,
      y: headerTextY - 32,
      size: metaFontSize,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    let textY = height - 120; // Move content upwards for better fit
    // Section Title Helper (subtle underline, no box, bold theme color, larger font)
    function drawSectionTitle(title, y) {
      const titleFontSize = 16;
      const underlineWidth = 120;
      // Title
      page.drawText(title, {
        x: marginX,
        y: y,
        size: titleFontSize,
        font: boldFont,
        color: sectionTitleTextColor
      });
      // Underline with a small gap below the text
      page.drawRectangle({
        x: marginX,
        y: y - 4, // 4px gap below the text baseline
        width: underlineWidth,
        height: 2,
        color: sectionTitleTextColor
      });
    }
    // Project Title
    drawSectionTitle("Project Title", textY);
    textY -= 22;
    // Draw Project Title in a box
    const titleText = project.title || "Untitled Project";
    const titleTextWidth = font.widthOfTextAtSize(titleText, 15);
    const titleBoxPaddingX = 18;
    const titleBoxHeight = 36;
    const titleBoxWidth = titleTextWidth + 2 * titleBoxPaddingX;
    const titleBoxX = marginX;
    const titleBoxY = textY - titleBoxHeight;
    // Lighter shadow
    page.drawRectangle({
      x: titleBoxX + 1,
      y: titleBoxY - 1,
      width: titleBoxWidth,
      height: titleBoxHeight,
      color: rgb(0.93, 0.95, 1),
      borderRadius: 6
    });
    // Lighter box
    page.drawRectangle({
      x: titleBoxX,
      y: titleBoxY,
      width: titleBoxWidth,
      height: titleBoxHeight,
      borderColor: themeColor,
      borderWidth: 0.7,
      color: rgb(0.98, 0.99, 1),
      borderRadius: 6
    });
    // Draw title text centered
    page.drawText(titleText, {
      x: titleBoxX + titleBoxPaddingX,
      y: titleBoxY + titleBoxHeight / 2 - 6,
      size: 15,
      font: font,
      color: rgb(0.1, 0.1, 0.1)
    });
    textY -= titleBoxHeight + 32; // Space after title box
    // Project Leader
    drawSectionTitle("Project Leader", textY);
    textY -= 22;
    // Draw Project Leader in a box
    const leaderText = project.leader?.name || leaderName || "Unknown Leader";
    const leaderTextWidth = font.widthOfTextAtSize(leaderText, 15);
    const leaderBoxPaddingX = 18;
    const leaderBoxHeight = 36;
    const leaderBoxWidth = leaderTextWidth + 2 * leaderBoxPaddingX;
    const leaderBoxX = marginX;
    const leaderBoxY = textY - leaderBoxHeight;
    // Lighter shadow
    page.drawRectangle({
      x: leaderBoxX + 1,
      y: leaderBoxY - 1,
      width: leaderBoxWidth,
      height: leaderBoxHeight,
      color: rgb(0.93, 0.95, 1),
      borderRadius: 6
    });
    // Lighter box
    page.drawRectangle({
      x: leaderBoxX,
      y: leaderBoxY,
      width: leaderBoxWidth,
      height: leaderBoxHeight,
      borderColor: themeColor,
      borderWidth: 0.7,
      color: rgb(0.98, 0.99, 1),
      borderRadius: 6
    });
    // Draw leader text centered
    page.drawText(leaderText, {
      x: leaderBoxX + leaderBoxPaddingX,
      y: leaderBoxY + leaderBoxHeight / 2 - 6,
      size: 15,
      font: font,
      color: rgb(0.1, 0.1, 0.1)
    });
    textY -= leaderBoxHeight + 32; // Space after leader box
    // Team Members
    drawSectionTitle("Team Members", textY);
    textY -= 22;
    // Parse team members
    let teamMembers = [];
    try {
      if (project.teamMembers) {
        teamMembers = JSON.parse(project.teamMembers);
      }
    } catch (error) {
      teamMembers = project.teamMembers ? [project.teamMembers] : ["No team members specified"];
    }
    // Arrange team members in a 3-row by 2-column grid (fill with empty boxes if fewer than 6)
    const maxMembers = 6;
    const gridRows = 3;
    const gridCols = 2;
    const memberBoxes = [...teamMembers];
    while (memberBoxes.length < maxMembers) memberBoxes.push("");
    let gridBoxWidth = 220;
    let gridBoxHeight = 32;
    let gridBoxPaddingX = 14;
    let gridBoxSpacingX = 24;
    let gridBoxSpacingY = 18;
    let gridStartX = marginX;
    let gridStartY = textY;
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const idx = row * gridCols + col;
        const name = memberBoxes[idx] || "";
        const boxX = gridStartX + col * (gridBoxWidth + gridBoxSpacingX);
        const boxY = gridStartY - row * (gridBoxHeight + gridBoxSpacingY);
        // Lighter shadow
        page.drawRectangle({
          x: boxX + 1,
          y: boxY - gridBoxHeight - 1,
          width: gridBoxWidth,
          height: gridBoxHeight,
          color: rgb(0.93, 0.95, 1),
          borderRadius: 6
        });
        // Lighter box
        page.drawRectangle({
          x: boxX,
          y: boxY - gridBoxHeight,
          width: gridBoxWidth,
          height: gridBoxHeight,
          borderColor: themeColor,
          borderWidth: 0.7,
          color: rgb(0.98, 0.99, 1),
          borderRadius: 6
        });
        // Draw name (if present)
        if (name) {
          page.drawText(name, {
            x: boxX + gridBoxPaddingX,
            y: boxY - gridBoxHeight / 2 - 5,
            size: 13,
            font: font,
            color: rgb(0.1, 0.1, 0.1)
          });
        }
      }
    }
    // Move Y below last row
    textY = gridStartY - gridRows * (gridBoxHeight + gridBoxSpacingY) - 8;
    textY -= 30; // Reduced space before Project Status
    // Project Status
    drawSectionTitle("Project Status", textY);
    textY -= 26;
    // Status pill: rounded, outlined, theme color border and text, centered
    let statusColor = sectionTitleTextColor;
    const status = project.status || "UNKNOWN";
    const pillWidth = 120;
    const pillHeight = 32;
    const pillX = marginX;
    const pillY = textY - pillHeight;
    page.drawRectangle({
      x: pillX,
      y: pillY,
      width: pillWidth,
      height: pillHeight,
      borderColor: statusColor,
      borderWidth: 2,
      color: rgb(1, 1, 1),
      borderRadius: 16
    });
    page.drawText(status, {
      x: pillX + (pillWidth - font.widthOfTextAtSize(status, 15)) / 2,
      y: pillY + (pillHeight - 15) / 2 + 2,
      size: 15,
      font: boldFont,
      color: statusColor
    });
    textY -= 56; // Reduced space before Components
    // Components
    drawSectionTitle("Components", textY);
    textY -= 18;
    // Components box with all components, word wrap, multi-column (max 3 columns, up to 30 items)
    const components = (project.components || "").split(',').map(c => c.trim()).filter(Boolean);
    const compBoxX = marginX;
    const compBoxY = textY;
    const compBoxWidth = width - 2 * marginX;
    const compBoxHeight = 188.4;
    // Shadow
    page.drawRectangle({
      x: compBoxX + 2,
      y: compBoxY - compBoxHeight - 2,
      width: compBoxWidth,
      height: compBoxHeight,
      color: rgb(0.85, 0.85, 0.95),
      borderRadius: 12
    });
    // Box
    page.drawRectangle({
      x: compBoxX,
      y: compBoxY - compBoxHeight,
      width: compBoxWidth,
      height: compBoxHeight,
      borderColor: themeColor,
      borderWidth: 1.5,
      color: lightThemeColor,
      borderRadius: 12
    });
    // List components inside box, up to 3 columns, all visible
    const maxCols = 3;
    const colCount = Math.min(maxCols, Math.ceil(components.length / 10));
    const colWidth = (compBoxWidth - 30) / colCount;
    const rowHeightComp = 18;
    const maxRows = Math.ceil(components.length / colCount);
    for (let col = 0; col < colCount; col++) {
      let y = compBoxY - 22;
      let x = compBoxX + 15 + col * colWidth;
      for (let i = 0; i < maxRows; i++) {
        const idx = col * maxRows + i;
        if (idx >= components.length) break;
        const comp = components[idx];
        page.drawText("•", {
          x: x,
          y: y,
          size: 12,
          font: boldFont,
          color: themeColor
        });
        page.drawText(comp, {
          x: x + 15,
          y: y,
          size: 12,
          font: font,
          color: rgb(0.1, 0.1, 0.1)
        });
        y -= rowHeightComp;
      }
    }
    // Footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 30,
      color: themeColor
    });
    page.drawText("Generated on: " + new Date().toLocaleDateString(), {
      x: marginX,
      y: 18,
      size: 10,
      font: font,
      color: rgb(1, 1, 1)
    });
    // If status is SUBMITTED, add a second page (keep previous logic for summary and image, but with improved style if you want)
    if (status === "SUBMITTED") {
      const secondPage = pdfDoc.addPage([595, 842]);
      
      // Header for second page
      secondPage.drawRectangle({
        x: 0,
        y: height - 80,
        width: width,
        height: 80,
        color: themeColor
      });
      
      secondPage.drawText("PROJECT SUMMARY", {
        x: 50,
        y: height - 45,
        size: 24,
        font: boldFont,
        color: rgb(1, 1, 1)
      });
      
      let secondPageY = height - 120;
      
      // Summary section
      secondPage.drawText("Summary", {
        x: 50,
        y: secondPageY,
        size: 16,
        font: boldFont,
        color: themeColor
      });
      
      secondPage.drawRectangle({
        x: 50,
        y: secondPageY - 2,
        width: 100,
        height: 2,
        color: themeColor
      });
      
      secondPageY -= 30;
      
      // Draw summary box with shadow
      secondPage.drawRectangle({
        x: 50 + 2,
        y: secondPageY - 200 - 2,
        width: width - 100,
        height: 200,
        color: rgb(0.9, 0.9, 0.9)
      });
      
      secondPage.drawRectangle({
        x: 50,
        y: secondPageY - 200,
        width: width - 100,
        height: 200,
        borderColor: themeColor,
        borderWidth: 1,
        color: lightThemeColor
      });
      
      // Draw summary text with word wrapping
      const summaryText = project.summary || "No summary provided";
      const words = summaryText.split(' ');
      let currentLine = '';
      let summaryY = secondPageY - 20;
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, 12);
        
        if (testWidth > width - 120) {
          secondPage.drawText(currentLine, {
            x: 60,
            y: summaryY,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
          });
          currentLine = word;
          summaryY -= 20;
          
          if (summaryY < secondPageY - 190) {
            currentLine += "...";
            break;
          }
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        secondPage.drawText(currentLine, {
          x: 60,
          y: summaryY,
          size: 12,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // Add project image if available
      if (project.projectPhoto) {
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
            const maxImgHeight = 200;
            const imgDims = image.scaleToFit(maxImgWidth, maxImgHeight);
            const imgX = (width - imgDims.width) / 2;
            const imgY = 100;
            
            // Add image box with shadow
            secondPage.drawRectangle({
              x: imgX - 5 + 2,
              y: imgY - 5 - 2,
              width: imgDims.width + 10,
              height: imgDims.height + 10,
              color: rgb(0.9, 0.9, 0.9)
            });
            
            secondPage.drawRectangle({
              x: imgX - 5,
              y: imgY - 5,
              width: imgDims.width + 10,
              height: imgDims.height + 10,
              borderColor: themeColor,
              borderWidth: 2,
              color: rgb(1, 1, 1)
            });
            
            secondPage.drawImage(image, {
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
      
      // Add footer to second page
      secondPage.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: 30,
        color: themeColor
      });
      
      secondPage.drawText("Page 2 of 2", {
        x: width - 100,
        y: 10,
        size: 10,
        font: font,
        color: rgb(1, 1, 1)
      });
    }
    // Save PDF in memory and upload to S3
    const pdfBytes = await pdfDoc.save();
    const s3Key = `${FOLDER_NAME}${leaderName?.replace(/\s+/g, "_") || "unknown_leader"}-${project.status}-project-${project.id}.pdf`;
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

// Send email with PDF attachment and HTML body
async function sendEmailWithPDF(userEmail, pdfBuffer, s3Key, project) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is not configured");
    }

    // Theme color
    const themeColor = "#364ED2"; // rgb(54/255, 78/255, 210/255) in hex

    // Construct HTML body
    let teamMembersHtml = "<p>No team members specified</p>";
    try {
      if (project.teamMembers) {
        const members = JSON.parse(project.teamMembers);
        if (members.length > 0) {
          teamMembersHtml = members.map(member => `<li style="margin-bottom: 5px;">${member}</li>`).join("");
          teamMembersHtml = `<ul style="padding-left: 20px;">${teamMembersHtml}</ul>`;
        }
      }
    } catch (error) {
      console.error("Error parsing team members for email:", error);
      teamMembersHtml = `<p>${project.teamMembers || "No team members specified"}</p>`;
    }

    const htmlBody = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <div style="background-color: ${themeColor}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">PROJECT REPORT</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: ${themeColor}; margin-top: 0;">Project Title</h2>
          <p>${project.title || "Untitled Project"}</p>

          <h2 style="color: ${themeColor}; margin-top: 20px;">Project Leader</h2>
          <p>${project.leader?.name || project.leaderName || "Unknown Leader"}</p>

          <h2 style="color: ${themeColor}; margin-top: 20px;">Team Members</h2>
          ${teamMembersHtml}

          <p style="margin-top: 30px;">Please find the full project report attached as a PDF.</p>
        </div>
        <div style="background-color: ${themeColor}; color: white; padding: 10px; text-align: center; font-size: 12px;">
          Generated by Tracklab
        </div>
      </div>
    `;

    // Brevo SMTP API: https://developers.brevo.com/reference/sendtransacemail
    const maxAttempts = 3;
    let attempt = 0;
    let lastError;
    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            sender: { email: process.env.EMAIL_FROM },
            to: [{ email: userEmail }],
            subject: `Project Report for ${project.title || "Untitled Project"}`,
            htmlContent: htmlBody,
            attachment: [
              {
                name: `${s3Key.split("/").pop()}`,
                content: Buffer.isBuffer(pdfBuffer) ? pdfBuffer.toString("base64") : pdfBuffer,
              },
            ],
          }),
        });

        if (!brevoResponse.ok) {
          const text = await brevoResponse.text();
          throw new Error(`Brevo API error (${brevoResponse.status}): ${text}`);
        }
        break; // success
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts) {
          const backoffMs = 250 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
      }
    }
    if (lastError) {
      throw lastError;
    }

    console.log("Email sent with PDF attachment and HTML body");
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

    // project.leaderName is not available directly on project, use project.leader.name
    const leaderName = project.leader?.name; // Use optional chaining
    if (!leaderName) console.warn(`Leader name not found for project ID ${project.id}`); // Log warning if leader name is missing

    const s3Key = `${FOLDER_NAME}${leaderName?.replace(/\s+/g, "_") || "unknown_leader"}-${project.status}-project-${project.id}.pdf`; // Handle missing leaderName in s3Key

    let pdfBuffer;

    if (await checkIfPdfExists(s3Key)) {
      console.log("PDF already exists. Fetching from S3...");
      pdfBuffer = await fetchPdfFromS3(s3Key);
    } else {
      console.log("PDF not found. Generating new PDF...");
      // Pass project object to generateAndUploadPDF
      await generateAndUploadPDF(project, leaderName, session.user);
      pdfBuffer = await fetchPdfFromS3(s3Key);
    }

    // Pass project object to sendEmailWithPDF
    await sendEmailWithPDF(session.user.email, pdfBuffer, s3Key, project);

    return new Response(JSON.stringify({ message: "PDF sent to your email" }), { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
