import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY environment variable is not set");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32)
    throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
  return buf;
}


/**
 * Encrypts plaintext using AES-256-CBC.
 * Returns a base64-encoded string: IV (random per call) + ":" + ciphertext.
 * A fresh IV is generated each call so identical plaintexts produce different ciphertexts.
 */
export function encrypt(plaintext: string): string {
  // Use a fresh random IV per encryption (ENCRYPTION_IV is the fallback seed for key derivation only)
  const iv = randomBytes(16);
  const key = getKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("base64")}`;
}

/**
 * Decrypts a value produced by encrypt().
 * Expects the format: "<hex IV>:<base64 ciphertext>"
 */
export function decrypt(ciphertext: string): string {
  const [ivHex, encryptedB64] = ciphertext.split(":");
  if (!ivHex || !encryptedB64)
    throw new Error("Invalid ciphertext format — expected '<iv>:<data>'");
  const iv = Buffer.from(ivHex, "hex");
  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Generate a new random 32-byte key (run once, store in env). */
export function generateKey(): string {
  return randomBytes(32).toString("hex");
}

/** Generate a new random 16-byte IV (run once, store in env). */
export function generateIV(): string {
  return randomBytes(16).toString("hex");
}
