import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isAdmin } from "@/lib/isAdmin";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbLogs = await prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const logs = dbLogs.map((log) => ({
      eventId: log.id,
      timestamp: log.createdAt.toISOString(),
      type: log.type,
      message: log.message,
      metadata: log.metadata,
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
} 