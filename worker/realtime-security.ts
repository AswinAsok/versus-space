export const MAX_CONNECTIONS_PER_ROOM = 200;
export const MAX_CONNECTIONS_PER_IP = 5;

export function isAllowedWebSocketOrigin(requestUrl: URL, origin: string | null) {
  if (origin === requestUrl.origin) return true;
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
    return localHosts.has(requestUrl.hostname) && localHosts.has(originUrl.hostname);
  } catch {
    return false;
  }
}

export function hasRealtimeCapacity(clientIps: Array<string | null>, clientIp: string) {
  return (
    clientIps.length < MAX_CONNECTIONS_PER_ROOM &&
    clientIps.filter((candidate) => candidate === clientIp).length < MAX_CONNECTIONS_PER_IP
  );
}
