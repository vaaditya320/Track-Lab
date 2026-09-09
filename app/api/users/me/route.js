import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BRANCHES = ["CS", "CSR", "CSAI", "CSDS", "AIDS", "CSIOT", "EC"];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const BATCHES = [
  "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3",
  "D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3",
  "G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3", "J1", "J2", "J3",
];

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { branch, section, batch, phoneNumber } = await req.json();

  if (branch && !BRANCHES.includes(branch)) {
    return new Response(JSON.stringify({ error: "Invalid branch" }), { status: 400 });
  }
  if (section && !SECTIONS.includes(section)) {
    return new Response(JSON.stringify({ error: "Invalid section" }), { status: 400 });
  }
  if (batch && !BATCHES.includes(batch)) {
    return new Response(JSON.stringify({ error: "Invalid batch" }), { status: 400 });
  }
  if (section && batch && !batch.startsWith(section)) {
    return new Response(JSON.stringify({ error: "Batch must belong to selected section" }), { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { branch, section, batch, phoneNumber },
    });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update user info" }), { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      regId: true,
      email: true,
      phoneNumber: true,
      branch: true,
      section: true,
      batch: true,
      role: true,
    },
  });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  return new Response(JSON.stringify(user), { status: 200 });
} 