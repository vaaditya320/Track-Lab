const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");

const prisma = new PrismaClient();

// Path to your Excel file
const FILE_PATH = "./students.xlsx";

async function uploadStudents() {
  console.log("Starting student upload...");

  try {
    console.log("Reading Excel file:", FILE_PATH);
    const workbook = xlsx.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0]; // First sheet
    console.log("Using sheet:", sheetName);
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    console.log("Converting sheet to JSON...");
    const students = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Extract student names from the sheet
    console.log("Extracting student names...");
    const studentNames = students.flat().filter(name => typeof name === "string" && name.trim() !== "");

    console.log(`Total students found: ${studentNames.length}`);

    if (studentNames.length === 0) {
      console.warn("No valid student names found in the sheet. Exiting.");
      return;
    }

    for (const name of studentNames) {
      console.log(`Processing student: ${name}`);
      await prisma.student.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      console.log(`Uploaded student: ${name}`);
    }

    console.log("All students uploaded successfully.");
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
