export function isSuperAdmin(session) {
  if (!session || !session.user) return false;
  
  return (
    session.user.email === "2023pietcsaaditya003@poornima.org" || 
    session.user.email === "vaaditya320@gmail.com" ||
    session.user.role === "SUPER_ADMIN"
  );
} 