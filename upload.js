const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");

const prisma = new PrismaClient();

// Path to your Excel file
const FILE_PATH = "./tracklab-students.xlsx";

async function uploadStudents() {
  console.log("Starting student upload...");

  try {
    console.log("Reading Excel file:", FILE_PATH);
    const workbook = xlsx.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0]; // First sheet
    console.log("Using sheet:", sheetName);
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON (header row is first row)
    console.log("Converting sheet to JSON...");
    const students = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Find header indices
    const header = students[0];
    const nameIdx = header.findIndex(h => h.toLowerCase().includes("name"));
    const regidIdx = header.findIndex(h => h.toLowerCase().includes("regid"));

    if (nameIdx === -1 || regidIdx === -1) {
      console.error("Could not find 'name' or 'regid' columns in the sheet header.");
      return;
    }

    // Process each student row (skip header)
    let count = 0;
    for (let i = 1; i < students.length; i++) {
      const row = students[i];
      const name = row[nameIdx]?.trim();
      const regId = row[regidIdx]?.trim();
      if (!name || !regId) continue;
      console.log(`Processing student: ${name} (${regId})`);
      await prisma.student.upsert({
        where: { regId },
        update: { name },
        create: { name, regId },
      });
      count++;
    }

    console.log(`All students uploaded successfully. Total: ${count}`);
  } catch (error) {
    console.error("Error uploading students:", error);
  } finally {
    console.log("Disconnecting from the database...");
    await prisma.$disconnect();
    console.log("Disconnected.");
  }
}

// Run the function
uploadStudents();
