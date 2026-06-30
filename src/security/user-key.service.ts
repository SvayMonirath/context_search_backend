import crypto from "crypto";
import { MasterEncryptionService } from "./master-encryption.service.js";

export class UserKeyService {
  constructor(private master: MasterEncryptionService) {}

  generateUserKey(): Buffer {
    return crypto.randomBytes(32);
  }

  encryptUserKey(userKey: Buffer): string {
    return this.master.encrypt(userKey.toString("hex"));
  }

  decryptUserKey(encryptedKey: string): Buffer {
    return Buffer.from(
      this.master.decrypt(encryptedKey),
      "hex",
    );
  }
}
