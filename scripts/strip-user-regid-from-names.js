/**
 * One-off migration: remove trailing registration ID from User.name.
 *
 * Example:
 *   "Aaditya Vinayak PIET23CS003" -> "Aaditya Vinayak"
 *
 * Run from project root:
 *   node scripts/strip-user-regid-from-names.js --dry-run
 *   node scripts/strip-user-regid-from-names.js
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function loadEnvFromDotenv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;

  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;

    const eq = t.indexOf("=");
    if (eq === -1) continue;

    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();

    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripTrailingRegIdFromName(name, regId) {
  if (!name || !regId || typeof name !== "string" || typeof regId !== "string") {
    return null;
  }

  const pattern = new RegExp(`\\s+${escapeRegExp(regId)}\\s*$`, "i");
  if (!pattern.test(name)) return null;

  const cleaned = name.replace(pattern, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

async function main() {
  loadEnvFromDotenv();
  const dryRun = process.argv.includes("--dry-run");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env or your environment.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, regId: true, email: true },
      orderBy: { email: "asc" },
    });

    let updated = 0;
    let skippedNoSuffix = 0;
    let skippedEmptyResult = 0;

    console.log(dryRun ? "DRY RUN - no database writes\n" : "Applying updates\n");

    for (const user of users) {
      const nextName = stripTrailingRegIdFromName(user.name, user.regId);

      if (nextName === null) {
        const lowerName = (user.name || "").toLowerCase();
        const lowerRegId = (user.regId || "").toLowerCase();
        if (lowerRegId && lowerName.endsWith(lowerRegId)) {
          skippedEmptyResult += 1;
        } else {
          skippedNoSuffix += 1;
        }
        continue;
      }

      if (dryRun) {
        console.log(`[dry-run] ${user.email}`);
        console.log(`  "${user.name}" -> "${nextName}"`);
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { name: nextName },
        });
        console.log(`${user.email}`);
        console.log(`  "${user.name}" -> "${nextName}"`);
      }

      updated += 1;
    }

    console.log("\n--- summary ---");
    console.log(`Updated:                ${updated}`);
    console.log(`Skipped (no suffix):    ${skippedNoSuffix}`);
    console.log(`Skipped (empty result): ${skippedEmptyResult}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
