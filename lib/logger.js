import prisma from "@/lib/prisma";

// Suggested (not enforced) log types. Keep `type` as a plain string in DB for flexibility.
export const LogType = {
  PROJECT_CREATION: "PROJECT_CREATION",
  PROJECT_DELETION: "PROJECT_DELETION",
  PROJECT_UPDATE: "PROJECT_UPDATE",
  USER_MANAGEMENT: "USER_MANAGEMENT",
  SYSTEM: "SYSTEM",
  OTHER: "OTHER",
};

export const logAdminAction = async (message, type = LogType.OTHER, metadata = {}) => {
  try {
    await prisma.adminLog.create({
      data: {
        message: String(message),
        type: String(type || LogType.OTHER),
        metadata,
      },
    });
  } catch (error) {
    // Never block admin flows due to logging failures.
    console.error("Failed to write admin log:", error);
  }
};