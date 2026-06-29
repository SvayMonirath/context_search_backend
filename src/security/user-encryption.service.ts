import crypto from "crypto";

export class UserEncryptionService {
  private readonly algorithm = "aes-256-gcm";

  constructor(private key: Buffer) {}

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.key,
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  }

  decrypt(text: string): string {
    const payload = Buffer.from(text, "base64");

    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const data = payload.subarray(28);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      iv,
    );

    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]).toString("utf8");
  }
}
