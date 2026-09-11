export const ADMIN_EMAIL = "kanri@example.com";

export function isAdmin(user) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}
