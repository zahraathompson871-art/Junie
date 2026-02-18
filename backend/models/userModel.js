import {pool} from "../config/db.js";


export const getAllUsers = async () => {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

export const getUserById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE users_id = ?", [id]);
    return rows[0];
}