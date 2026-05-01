export const ADMIN_AUTH_COOKIE = "faste_admin_token";
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    maxAge: ADMIN_TOKEN_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };
}
