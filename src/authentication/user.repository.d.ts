import type z from "zod";
declare class UserRepository {
    get_user_by_email: (email: string) => Promise<{
        username: string;
        email: string;
        hash_password: string;
        id: string;
        created_at: Date;
    } | null>;
    get_user_by_username: (username: string) => Promise<{
        username: string;
        email: string;
        hash_password: string;
        id: string;
        created_at: Date;
    } | null>;
    create_user: (userData: z.infer<typeof import("./authentication.request.js").Register_Request>) => Promise<{
        username: string;
        email: string;
        hash_password: string;
        id: string;
        created_at: Date;
    }>;
}
export default UserRepository;
//# sourceMappingURL=user.repository.d.ts.map