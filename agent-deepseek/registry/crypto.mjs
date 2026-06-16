/**
 * AES-256-GCM symmetric encryption for tenant secrets at rest.
 *
 * Key: APP_ENC_KEY in env — 32-byte hex string (64 hex chars).
 * Storage format: <hex-iv>:<hex-tag>:<hex-ciphertext>
 *
 * Security notes:
 * - Fresh random 96-bit (12-byte) IV per encryption; nonce reuse under GCM is catastrophic.
 * - Key is never logged; encrypted blobs are safe to store in SQLite.
 * - Blast radius: DB + key on same host means host-compromise decrypts all tenant creds.
 *   Future hardening: KMS/envelope encryption (per-tenant DEK wrapped by KMS master key).
 */
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN  = 12; // 96-bit recommended for GCM
const TAG_LEN = 16;

function getMasterKey() {
  const hex = process.env.APP_ENC_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "APP_ENC_KEY must be a 32-byte hex string (64 hex chars). " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string.
 * @param {string} plaintext
 * @returns {string}  "<hex-iv>:<hex-tag>:<hex-ciphertext>"
 */
export function encrypt(plaintext) {
  const key = getMasterKey();
  const iv  = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  const enc  = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag  = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

/**
 * Decrypt a blob produced by encrypt().
 * @param {string} blob  "<hex-iv>:<hex-tag>:<hex-ciphertext>"
 * @returns {string} plaintext
 */
export function decrypt(blob) {
  const parts = blob.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted blob format");
  const [ivHex, tagHex, ctHex] = parts;
  const key    = getMasterKey();
  const iv     = Buffer.from(ivHex,  "hex");
  const tag    = Buffer.from(tagHex, "hex");
  const ct     = Buffer.from(ctHex,  "hex");
  const decipher = createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}
