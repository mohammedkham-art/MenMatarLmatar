export const adminSessionCookieName = 'mmlm_admin_session';

const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sign(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  );

  return toHex(signature);
}

export async function createAdminSessionToken(secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const signature = await sign(issuedAt, secret);

  return `${issuedAt}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string | undefined,
) {
  if (!token || !secret) {
    return false;
  }

  const [issuedAt, signature] = token.split('.');
  const issuedAtNumber = Number(issuedAt);

  if (!issuedAt || !signature || !Number.isFinite(issuedAtNumber)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  if (issuedAtNumber > now || now - issuedAtNumber > sessionMaxAgeSeconds) {
    return false;
  }

  const expectedSignature = await sign(issuedAt, secret);

  return signature === expectedSignature;
}

export const adminSessionMaxAgeSeconds = sessionMaxAgeSeconds;
