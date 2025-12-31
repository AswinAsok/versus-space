const IP_CACHE_KEY = 'versus_client_ip';

// Multiple IP APIs for redundancy
const IP_APIS = [
  { url: 'https://api.ipify.org?format=json', parser: (data: { ip?: string }) => data.ip },
  { url: 'https://api.ip.sb/ip', parser: (data: string) => data.trim() },
  { url: 'https://ipapi.co/ip/', parser: (data: string) => data.trim() },
];

export async function getClientIp(): Promise<string> {
  if (typeof window === 'undefined') return 'unknown';

  const cached = sessionStorage.getItem(IP_CACHE_KEY);
  if (cached && cached !== 'unknown') return cached;

  // Try multiple IP APIs for redundancy
  for (const api of IP_APIS) {
    try {
      const response = await fetch(api.url, {
        signal: AbortSignal.timeout(3000) // 3 second timeout per API
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');
        const data = isJson ? await response.json() : await response.text();
        const ip = api.parser(data);
        if (ip && isValidIp(ip)) {
          sessionStorage.setItem(IP_CACHE_KEY, ip);
          return ip;
        }
      }
    } catch {
      // Try next API
      continue;
    }
  }

  console.warn('All IP APIs failed, using fingerprint fallback');

  // Generate a stable browser fingerprint as last resort
  // This persists across incognito sessions on the same browser
  const fingerprint = await generateBrowserFingerprint();
  sessionStorage.setItem(IP_CACHE_KEY, fingerprint);
  return fingerprint;
}

function isValidIp(ip: string): boolean {
  // Basic IPv4/IPv6 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip.includes(':');
}

async function generateBrowserFingerprint(): Promise<string> {
  // Create a stable fingerprint from browser characteristics
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
  ];

  const str = components.join('|');

  // Use SubtleCrypto for hashing if available
  if (crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `fp_${hashHex.substring(0, 16)}`;
  }

  // Simple hash fallback
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}
