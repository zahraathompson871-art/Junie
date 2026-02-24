import {pool} from "../config/db.js";

export const getUserByEmail = async (email) => {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ?", [email]
    );
    return rows[0];
}
export const getAllUsers = async () => {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

export const getUserById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE users_id = ?", [id]);
    return rows[0];
};

export const createUser = async (data) => {
    const {full_name, email, password_hash} = data;
    const [result] = await pool.query("INSERT INTO users (full_name, email, password_hash) VALUES (?,?,?)",[full_name, email,password_hash]);
    return { id: result.insertId, full_name, email};
};

export const deleteUserByEmail = async (email) => {
    const [result] = await pool.query(
        "DELETE FROM users WHERE email = ?",[email]
    );
    return result.affectedRows;
};

export const updateUserByEmail = async (email, updates) => {
    const {full_name, avatar} = updates;

    const[result] = await pool.query(

        "UPDATE users SET full_name= ?, avatar = ? WHERE email = ?",
        [full_name,avatar,email]
    );

    if(result.affectedRows === 0) return null;

    const[rows] = await db.query(
        "SELECT user_id, full_name, email, avatar FROM users WHERE email = ?",[email]
    );

    return rows[0];
};

export const createUserStats = async (userId) => {
    await db.execute(
        "INSERT INTO user_stats (user_id, views, engagement) VALUES (?, 0, 0)",
        [userId]
    );
};

export const createUserGoals = async (userId) => {
    await db.execute(
        "INSERT INTO goals (user_id, target, current, total) VALUES (?, 'Set your first goal', 0, 100)",
        [userId]
    );
};

export const createUserMotivation = async (userId) => {
    await db.execute(
        "INSERT INTO motivation (user_id, text) VALUES (?, ?),(?,?)",
        [userId, "Stay consistent!", userId, "Keep pushing forward!"]
    );
};

export const createUserChallenges = async (userId) => {
    await db.execute(
        "INSERT INTO challenges (user_id, title, participants, progress) VALUES (?, 'No challenge', 0, '0%')",
        [userId, userId]
    );
};

export const createUserTasks = async (userId) => {
    await db.execute(
        "INSERT INTO tasks (user_id, task_task, completed) VALUES (?, ?, 0),(?,?,0),(?,?,0)",
        [
            userId, "Finish new templates design",
            userId, "Upload product images",
            userId, "Respnd to collab requests",
        ]
    );
};