import {pool} from '../config/db.js';

export const createPage = async (bookId, title) => {
    const [result] = await pool.query(
        "INSERT INTO pages (book_id, title, content) VALUES (?, ? ,?)",
        [bookId, title, ""]
    );
    return { id: result.insertId, bookId, title, content: "" };
};

export const getPagesByBook = async (bookId) => {
    const [rows] = await pool.query(
        "SELECT * FROM pages WHERE book_id = ? ORDER BY id ASC",
        [bookId]
    );
    return rows;
};

export const getPageById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM pages WHERE id = ?",
        [id]
    );
    return rows[0];
};

export const updatePage = async (id, updates) => {
    const { title, content } = updates;
    await pool.query(
        "UPDATE pages SET title = ?, content = ? WHERE id = ?",
        [title, content, id]
    );
    const [rows] = await pool.query(
        "SELECT * FROM pages WHERE id = ?",
        [id]
    );
    return rows[0];
};

export const deletePage = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM pages WHERE id = ?",
        [id]
    );
    return result.affectedRows;
};