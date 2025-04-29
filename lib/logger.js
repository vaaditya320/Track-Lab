import { CloudWatchLogsClient, CreateLogStreamCommand, PutLogEventsCommand, DescribeLogStreamsCommand } from "@aws-sdk/client-cloudwatch-logs";

const LOG_GROUP_NAME = process.env.LOG_GROUP_NAME || 'Tracklab';
const LOG_STREAM_NAME = 'Admin Actions';

class CloudWatchLogger {
  constructor() {
    this.client = new CloudWatchLogsClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.sequenceToken = null;
    this.initialized = false;
  }

  async ensureLogStreamExists() {
    if (this.initialized) return;

    try {
      // Check if log stream exists
      const describeResponse = await this.client.send(
        new DescribeLogStreamsCommand({
          logGroupName: LOG_GROUP_NAME,
          logStreamNamePrefix: LOG_STREAM_NAME,
        })
      );

      const existingStream = describeResponse.logStreams?.find(
        (stream) => stream.logStreamName === LOG_STREAM_NAME
      );

      if (!existingStream) {
        // Create new log stream if it doesn't exist
        await this.client.send(
          new CreateLogStreamCommand({
            logGroupName: LOG_GROUP_NAME,
            logStreamName: LOG_STREAM_NAME,
          })
        );
      } else {
        this.sequenceToken = existingStream.uploadSequenceToken;
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize CloudWatch logger:', error);
      // Don't throw - we'll handle errors silently
    }
  }

  async logAdminAction(message) {
    try {
      await this.ensureLogStreamExists();

      if (!this.initialized) {
        console.warn('CloudWatch logger not initialized, logging locally only');
        console.log(`[Admin Action] ${message}`);
        return;
      }

      const timestamp = Date.now();
      const logEvent = {
        timestamp,
        message: JSON.stringify({
          message,
          timestamp: new Date(timestamp).toISOString(),
        }),
      };

      const command = new PutLogEventsCommand({
        logGroupName: LOG_GROUP_NAME,
        logStreamName: LOG_STREAM_NAME,
        logEvents: [logEvent],
        sequenceToken: this.sequenceToken,
      });

      const response = await this.client.send(command);
      this.sequenceToken = response.nextSequenceToken;
    } catch (error) {
      // Log locally but don't break the flow
      console.error('Failed to log to CloudWatch:', error);
      console.log(`[Admin Action] ${message}`);
    }
  }
}

// Create a singleton instance
const cloudWatchLogger = new CloudWatchLogger();

// Export the logging function
export const logAdminAction = (message) => cloudWatchLogger.logAdminAction(message); 