/** Full URL guests use to open this session (they must sign in). */
export function getMeetingJoinUrl(sessionId) {
  if (typeof window === "undefined" || !sessionId) return "";
  return `${window.location.origin}/session/${sessionId}?role=guest`;
}

/** Short grouped code for reading aloud (joining still requires the full link). */
export function formatMeetingCode(sessionId) {
  if (!sessionId || typeof sessionId !== "string") return "";
  const hex = sessionId.replace(/[^a-f0-9]/gi, "");
  if (hex.length < 12) return sessionId.slice(0, 14);
  return hex
    .slice(0, 12)
    .toUpperCase()
    .match(/.{1,4}/g)
    .join("-");
}
