/**
 * One-off migration: normalize User.regId from email-local-part style to college format.
 *
 * From: 2023pietcsaaditya003  (YYYY + piet + branch + name + roll3)
 * To:   PIET23CS003          (PIET + YY + BRANCH + roll3)
 *
 * Branches (case-insensitive in source): CS, CR, CA, CD, AD, CI, EC
 *
 * Run from project root (DATABASE_URL loaded from .env if not already set):
 *   node scripts/normalize-user-regids.js --dry-run
 *   node scripts/normalize-user-regids.js
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

loadEnvFromDotenv();

/** Two-letter branch codes after "piet", lowercase in stored regId */
const BRANCH_ALT = "cs|cr|ca|cd|ad|ci|ec";

const OLD_REGID_RE = new RegExp(
  `^(\\d{4})piet(${BRANCH_ALT})([a-z]+)(\\d{3})$`,
  "i"
);

function toCollegeRegId(year4, branchLc, roll3) {
  const yy = String(year4).slice(-2);
  const br = String(branchLc).toUpperCase();
  const roll = String(roll3).padStart(3, "0");
  return `PIET${yy}${br}${roll}`;
}

function transformRegId(oldRegId) {
  if (!oldRegId || typeof oldRegId !== "string") return null;
  const m = oldRegId.trim().match(OLD_REGID_RE);
  if (!m) return null;
  const [, year4, branch, , roll3] = m;
  return toCollegeRegId(year4, branch, roll3);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env or your environment.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  const users = await prisma.user.findMany({
    select: { id: true, regId: true, name: true, email: true, role: true },
    orderBy: { email: "asc" },
  });

  let updated = 0;
  let skippedNoMatch = 0;
  let skippedSame = 0;
  let skippedConflict = 0;

  console.log(
    dryRun
      ? "DRY RUN — no database writes\n"
      : "Applying updates to database\n"
  );

  for (const u of users) {
    const next = transformRegId(u.regId);
    if (next === null) {
      skippedNoMatch += 1;
      continue;
    }
    if (next === u.regId) {
      skippedSame += 1;
      continue;
    }

    const conflict = await prisma.user.findFirst({
      where: { regId: next, NOT: { id: u.id } },
      select: { id: true, email: true },
    });

    if (conflict) {
      console.error(
        `SKIP conflict: cannot set ${u.email} regId "${u.regId}" -> "${next}" (already used by ${conflict.email})`
      );
      skippedConflict += 1;
      continue;
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${u.role}\t${u.email}\n          ${u.regId} -> ${next}`
      );
    } else {
      await prisma.user.update({
        where: { id: u.id },
        data: { regId: next },
      });
      console.log(`${u.email}\n  ${u.regId} -> ${next}`);
    }
    updated += 1;
  }

  console.log("\n--- summary ---");
  console.log(`Updated:           ${updated}`);
  console.log(`Skipped (no match): ${skippedNoMatch}`);
  console.log(`Skipped (already):  ${skippedSame}`);
  console.log(`Skipped (conflict): ${skippedConflict}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
