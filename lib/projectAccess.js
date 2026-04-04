/**
 * @param {object} project - Must include leaderId, assignedTeacherId, and optionally members: { userId }[]
 * @param {string} sessionUserId
 */
export function getProjectAccess(project, sessionUserId) {
  const isLeader = project.leaderId === sessionUserId;
  const isAssignedTeacher =
    project.assignedTeacherId != null &&
    project.assignedTeacherId === sessionUserId;
  const memberIds =
    project.members?.map((m) => m.userId).filter(Boolean) ?? [];
  const isMember = memberIds.includes(sessionUserId);
  return { isLeader, isMember, isAssignedTeacher };
}

export function canViewStudentProject(access) {
  return access.isLeader || access.isMember || access.isAssignedTeacher;
}

/**
 * @param {ReturnType<typeof getProjectAccess>} access
 * @returns {'leader' | 'member' | 'teacher' | null}
 */
export function viewerRoleFromAccess(access) {
  if (access.isLeader) return "leader";
  if (access.isMember) return "member";
  if (access.isAssignedTeacher) return "teacher";
  return null;
}
