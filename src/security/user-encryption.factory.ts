import { MasterEncryptionService } from "./master-encryption.service.js";
import { UserKeyService } from "./user-key.service.js";
import { UserEncryptionService } from "./user-encryption.service.js";
import UserRepository from "../authentication/user.repository.js";

export class UserEncryptionFactory {
  constructor(
    private master: MasterEncryptionService,
    private repo: UserRepository,
  ) {}

  async create(userId: string): Promise<UserEncryptionService> {
    const userKeyService = new UserKeyService(this.master);

    const encryptedKey = await this.repo.get_encrypted_key(userId);

    const userKey = userKeyService.decryptUserKey(encryptedKey);

    return new UserEncryptionService(userKey);
  }

  async initializeUserKey(userId: string) {
    const userKeyService = new UserKeyService(this.master);
    const key = userKeyService.generateUserKey();
    const encrypted = userKeyService.encryptUserKey(key);
    return await this.repo.save_encrypted_key(userId, encrypted);
  }
}
