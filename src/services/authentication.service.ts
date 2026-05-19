import UserRepository from "../repositories/user.repository.js"
import z from "zod";
import { Register_Request } from "../dtos/authentication.request.js";

export class AuthenticationService {
  constructor(private user_repository: UserRepository) {
    this.user_repository = user_repository
  }

  register = async (userData: z.infer<typeof Register_Request>) => {
    return await this.user_repository.create_user(userData)
  }

}
