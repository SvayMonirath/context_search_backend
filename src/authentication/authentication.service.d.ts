import z from "zod";
import { Register_Request, Login_Request } from "./authentication.request.js";
import PasswordService from "./password.service.js";
import UserRepository from "./user.repository.js";
export declare class AuthenticationService {
    private user_repository;
    private password_service;
    constructor(user_repository: UserRepository, password_service: PasswordService);
    register: (userData: z.infer<typeof Register_Request>) => Promise<boolean>;
    login: (userData: z.infer<typeof Login_Request>) => Promise<{
        user: {
            username: string;
            email: string;
            hash_password: string;
            id: string;
            created_at: Date;
        };
        access_token: any;
    }>;
}
//# sourceMappingURL=authentication.service.d.ts.map