import {pool} from "../config/db.js";

export const createBook = async (workspaceId, title, ownerId) => {
    const [workspaceRows] = await pool.query(
        "SELECT id FROM workspaces WHERE id = ? AND owner_id = ?",
        [workspaceId, ownerId]
    );
    if (!workspaceRows.length) return null;

    const [result] = await pool.query(
        "INSERT INTO books (workspace_id, title) VALUES (?, ?)",
        [workspaceId, title]
    );
    return { id: result.insertId, workspaceId, title };
};

export const getBooksByWorkspace = async (workspaceId, ownerId) => {
    const [rows] = await pool.query(
        `SELECT b.*
         FROM books b
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE b.workspace_id = ? AND w.owner_id = ?
         ORDER BY b.id ASC`,
        [workspaceId, ownerId]
    );
    return rows;
};

export const getBookById = async (id, ownerId) => {
    const [rows] = await pool.query(
        `SELECT b.*
         FROM books b
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE b.id = ? AND w.owner_id = ?`,
        [id, ownerId]
    );
    return rows[0];
};

export const updateBook = async (id, updates, ownerId) => {
    const { title } = updates;
    await pool.query(
        `UPDATE books b
         JOIN workspaces w ON w.id = b.workspace_id
         SET b.title = ?
         WHERE b.id = ? AND w.owner_id = ?`,
        [title, id, ownerId]
    );
    return getBookById(id, ownerId);
};

export const deleteBook = async (id, ownerId) => {
    const [result] = await pool.query(
        `DELETE b FROM books b
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE b.id = ? AND w.owner_id = ?`,
        [id, ownerId]
    );
    return result.affectedRows;
};
