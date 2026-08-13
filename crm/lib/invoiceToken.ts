import { createHmac } from "crypto";

const ALGORITHM = "sha256";

function getSecret(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is not set");
  return key;
}

/**
 * Create an HMAC-signed token for passwordless invoice viewing.
 * Token format: `<invoiceId>.<expiryUnix>.<hex signature>`
 * Default expiry: 90 days.
 */
export function createInvoiceToken(invoiceId: string, expiryDays = 90): string {
  const expiry = Math.floor(Date.now() / 1000) + expiryDays * 86400;
  const payload = `${invoiceId}.${expiry}`;
  const sig = createHmac(ALGORITHM, getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/**
 * Validate an invoice token. Returns the invoiceId if valid, null otherwise.
 */
export function validateInvoiceToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [invoiceId, expiryStr, sig] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry)) return null;
  if (Math.floor(Date.now() / 1000) > expiry) return null;

  const expected = createHmac(ALGORITHM, getSecret())
    .update(`${invoiceId}.${expiryStr}`)
    .digest("hex");

  if (sig !== expected) return null;
  return invoiceId;
}
