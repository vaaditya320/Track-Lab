import { isSuperAdmin } from "./isSuperAdmin";

export function isAdmin(session) {
  if (!session || !session.user) return false;
  
  return session.user.role === "ADMIN" || isSuperAdmin(session);
} 