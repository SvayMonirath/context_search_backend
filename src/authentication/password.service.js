import bcrypt from "bcryptjs";
class PasswordService {
    async hash_password(plain_password) {
        const saltRounds = Number(process.env.HASH_SALT_ROUNDS) || 10;
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(plain_password, salt);
    }
    async compare_password(plain_password, hash_password) {
        return await bcrypt.compare(plain_password, hash_password);
    }
}
export default PasswordService;
//# sourceMappingURL=password.service.js.map