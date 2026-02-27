import crypto from "crypto";

const ALGO = "aes-256-gcm";
const PREFIX = "enc:v1";
let warnedMissingKey = false;

const getKeyBuffer = () => {
  const raw = process.env.NOTE_CONTENT_KEY || "";
  if (!raw) {
    if (!warnedMissingKey) {
      console.warn("NOTE_CONTENT_KEY is not set. Notebook content will be stored without encryption.");
      warnedMissingKey = true;
    }
    return null;
  }

  try {
    const key = Buffer.from(raw, "base64");
    if (key.length === 32) return key;
  } catch {
  }

  try {
    const key = Buffer.from(raw, "hex");
    if (key.length === 32) return key;
  } catch {
  }

  throw new Error("Invalid NOTE_CONTENT_KEY. Use a 32-byte key in base64 or hex.");
};

export const encodeNotebookContent = (content) => {
  const plainText = JSON.stringify(content ?? {});
  const key = getKeyBuffer();
  if (!key) return plainText;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    __enc: `${PREFIX}:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`
  });
};

export const decodeNotebookContent = (storedValue) => {
  if (storedValue === null || storedValue === undefined) return {};
  if (typeof storedValue !== "string") {
    if (storedValue && typeof storedValue === "object" && typeof storedValue.__enc === "string") {
      return decryptToken(storedValue.__enc);
    }
    return storedValue || {};
  }

  if (storedValue.startsWith(`${PREFIX}:`)) {
    return decryptToken(storedValue);
  }

  try {
    const parsed = JSON.parse(storedValue);
    if (parsed && typeof parsed === "object" && typeof parsed.__enc === "string") {
      return decryptToken(parsed.__enc);
    }
    return parsed || {};
  } catch {
    return {};
  }
};

const decryptToken = (token) => {
  const key = getKeyBuffer();
  if (!key) return {};

  const parts = token.split(":");
  if (parts.length !== 5) return {};

  const iv = Buffer.from(parts[2], "base64");
  const tag = Buffer.from(parts[3], "base64");
  const encrypted = Buffer.from(parts[4], "base64");

  try {
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    return JSON.parse(decrypted);
  } catch {
    return {};
  }
};
