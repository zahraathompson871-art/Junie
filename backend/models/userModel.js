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
}