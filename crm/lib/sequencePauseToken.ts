import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return process.env.NEXTAUTH_SECRET ?? "bluuhq-sequence-pause-secret";
}

export function generatePauseToken(enrollmentId: string): string {
  const payload = `pause:${enrollmentId}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${enrollmentId}.${sig}`).toString("base64url");
}

export function verifyPauseToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dotIndex = decoded.lastIndexOf(".");
    if (dotIndex === -1) return null;

    const id  = decoded.slice(0, dotIndex);
    const sig = decoded.slice(dotIndex + 1);
    if (!id) return null;

    const expected = createHmac("sha256", secret()).update(`pause:${id}`).digest("hex");
    const sigBuf  = Buffer.from(sig);
    const expBuf  = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    return id;
  } catch {
    return null;
  }
}
