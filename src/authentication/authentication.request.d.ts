import z from "zod";
export declare const Register_Request: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    hash_password: z.ZodString;
    confirm_password: z.ZodString;
}, z.z.core.$strip>;
export declare const Login_Request: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.z.core.$strip>;
export declare const JWT_Payload: z.ZodObject<{
    user_id: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=authentication.request.d.ts.map