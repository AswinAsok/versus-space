export function getSessionId(): string {
  let sessionId = localStorage.getItem('versus_session_id');

  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('versus_session_id', sessionId);
  }

  return sessionId;
}
