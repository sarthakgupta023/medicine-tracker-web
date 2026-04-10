/**
 * Decode JWT payload in the browser (handles base64url, which atob() alone does not).
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * True if we have a user id and a non-expired JWT, or a legacy non-JWT token string.
 */
export function isSessionValid(token, userId) {
  if (!token || !userId) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return token.length > 0;
  }
  if (payload.exp != null && typeof payload.exp === "number") {
    return payload.exp * 1000 > Date.now();
  }
  return true;
}
