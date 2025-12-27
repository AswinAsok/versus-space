const IP_CACHE_KEY = 'versus_client_ip';

export async function getClientIp(): Promise<string> {
  if (typeof window === 'undefined') return 'unknown';

  const cached = sessionStorage.getItem(IP_CACHE_KEY);
  if (cached) return cached;

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (response.ok) {
      const data = (await response.json()) as { ip?: string };
      if (data.ip) {
        sessionStorage.setItem(IP_CACHE_KEY, data.ip);
        return data.ip;
      }
    }
  } catch (error) {
    console.warn('Unable to retrieve client IP, falling back to session id', error);
  }

  const fallback = localStorage.getItem('versus_session_id') ?? 'unknown';
  sessionStorage.setItem(IP_CACHE_KEY, fallback);
  return fallback;
}
