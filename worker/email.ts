function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export async function sendAuthEmail(
  env: Env,
  to: string,
  subject: string,
  action: string,
  url: string
) {
  const safeUrl = escapeHtml(url);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Versus.Space <${env.AUTH_EMAIL_FROM}>`,
      to: [to],
      subject,
      text: `${action}: ${url}`,
      html: `<p>${escapeHtml(action)}</p><p><a href="${safeUrl}">${safeUrl}</a></p>`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend rejected the auth email with HTTP ${response.status}`);
  }
}
