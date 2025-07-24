import bcrypt from "bcrypt";
import User from "../../models/Users.js";

// Save hashed password & insert
export async function createUserMongo(snUser, plainPassword) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newUser = new User({...snUser, password: hashedPassword });
    return newUser.save();
}

export const getUserMongo = (sys_id) => User.findOne({ sys_id });

export const updateUserMongo = async(sys_id, updates) => {
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }
    return User.findOneAndUpdate({ sys_id }, updates, { new: true });
};

export const deleteUserMongo = (sys_id) => User.findOneAndDelete({ sys_id });