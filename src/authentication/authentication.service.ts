import z from "zod";
import { Register_Request, Login_Request } from "./authentication.request.js";
// dependencies
import PasswordService from "./password.service.js";
import UserRepository from "./user.repository.js";
import { generate_access_token } from "../utils/jwt.utils.js";
import { UserEncryptionFactory } from "../security/user-encryption.factory.js";

export class AuthenticationService {
  constructor(
    private user_repository: UserRepository,
    private password_service: PasswordService,
    private user_encryption_factory: UserEncryptionFactory,
  ) {}

  register = async (userData: z.infer<typeof Register_Request>) => {
    if (await this.user_repository.get_user_by_email(userData.email)) {
      throw new Error("Email already exists");
    }
    if (await this.user_repository.get_user_by_username(userData.username)) {
      throw new Error("Username already exists");
    }
    if (userData.hash_password !== userData.confirm_password) {
      throw new Error("Password and confirm password do not match");
    }

    userData.hash_password = await this.password_service.hash_password(
      userData.hash_password,
    );
    const user = await this.user_repository.create_user(userData);
    if(!user) {
      throw new Error("Error creating user");
    }

    const result = await this.user_encryption_factory.initializeUserKey(user.id);

    if(!result) {
      this.user_repository.delete_user(user.id);
      throw new Error("Error initializing user encryption key");
    }
    return true;
  };

  login = async (userData: z.infer<typeof Login_Request>) => {
    const user = await this.user_repository.get_user_by_email(userData.email);
    if (!user) {
      throw new Error("Email or Password is incorrect");
    }

    const isMatch = await this.password_service.compare_password(
      userData.password,
      user.hash_password,
    );
    if (!isMatch) {
      throw new Error("Email or Password is incorrect");
    }

    const access_token = generate_access_token({
      user_id: user.id,
      username: user.username,
      email: user.email,
    });

    return { user, access_token };
  };
}
