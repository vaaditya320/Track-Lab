import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CloudWatchLogsClient, GetLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

// Use the same log group name as in lib/logger.js
const LOG_GROUP_NAME = 'Tracklab';
const LOG_STREAM_NAME = 'Admin Actions';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = new CloudWatchLogsClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new GetLogEventsCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamName: LOG_STREAM_NAME,
      limit: 100, // Fetch last 100 log events
      startFromHead: false, // Get most recent logs first
    });

    const response = await client.send(command);
    
    // Parse the log messages
    const logs = response.events.map(event => {
      try {
        const parsedMessage = JSON.parse(event.message);
        return {
          message: parsedMessage.message,
          timestamp: parsedMessage.timestamp,
          eventId: event.eventId
        };
      } catch (e) {
        return {
          message: event.message,
          timestamp: new Date(event.timestamp).toISOString(),
          eventId: event.eventId
        };
      }
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
} 