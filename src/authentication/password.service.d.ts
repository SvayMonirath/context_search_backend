declare class PasswordService {
    hash_password(plain_password: string): Promise<string>;
    compare_password(plain_password: string, hash_password: string): Promise<boolean>;
}
export default PasswordService;
//# sourceMappingURL=password.service.d.ts.map