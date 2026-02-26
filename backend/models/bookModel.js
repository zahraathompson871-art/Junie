import {pool} from "../config/db.js";

export const createBOOK = async (workspaceId, title) => {
    const [result] = await pool.query(
        "INSERT INTO books (workspace_id, title) VALUES (?, ?)",
        [workspaceId, title]
    );
    return { id: result.insertId, workspaceId, title };
}

export const getBooksByWorkspace = async (workspaceId) => {
    const [rows] = await pool.query(
        "SELECT * FROM books WHERE workspace_id = ? ORDER BY id ASC",
        [workspaceId]
    );
    return rows;
};

export const updateBook = async (id, updates) => {
    const { title } = updates;
    await db.query(
        "UPDATE books SET title = ? WHERE id = ?",
        [title, id]
    );
    const [rows] = await pool.query(
        "SELECT * FROM books WHERE id = ?",
        [id]
    );
    return rows[0];
};

export const deleteBook = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM books WHERE id = ?",
        [id]
    );
    return result.affectedRows;
};