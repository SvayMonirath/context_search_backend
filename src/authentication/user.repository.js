import prisma from "../prisma.client.js";
class UserRepository {
    get_user_by_email = async (email) => {
        try {
            return await prisma.user.findUnique({
                where: { email },
            });
        }
        catch (error) {
            throw new Error("Error fetching user by email");
        }
    };
    get_user_by_username = async (username) => {
        try {
            return await prisma.user.findUnique({
                where: { username },
            });
        }
        catch (error) {
            throw new Error("Error fetching user by username");
        }
    };
    create_user = async (userData) => {
        try {
            return await prisma.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    hash_password: userData.hash_password,
                },
            });
        }
        catch (error) {
            throw new Error("Error creating user");
        }
    };
}
export default UserRepository;
//# sourceMappingURL=user.repository.js.map