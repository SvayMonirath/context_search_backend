import crypto from "crypto";

export class MasterEncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly key: Buffer;

  constructor() {
    const key = process.env.MASTER_ENCRYPTION_KEY;

    if (!key) throw new Error("MASTER_ENCRYPTION_KEY missing");

    this.key = Buffer.from(key, "hex");

    if (this.key.length !== 32) {
      throw new Error("MASTER_ENCRYPTION_KEY must be 32 bytes");
    }
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  }

  decrypt(ciphertext: string): string {
    const payload = Buffer.from(ciphertext, "base64");

    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const data = payload.subarray(28);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]).toString("utf8");
  }
}
