import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.idealabProject.findMany();

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching idealab projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

