import {pool} from '../config/db.js';

const withPageContentColumn = async (onWithContent, onWithoutContent) => {
    try {
        return await onWithContent();
    } catch (err) {
        if (err?.code === "ER_BAD_FIELD_ERROR" || String(err?.message || "").includes("Unknown column 'content'")) {
            return onWithoutContent();
        }
        throw err;
    }
};

export const createPage = async (bookId, title, ownerId) => {
    const [bookRows] = await pool.query(
        `SELECT b.id
         FROM books b
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE b.id = ? AND w.owner_id = ?`,
        [bookId, ownerId]
    );
    if (!bookRows.length) return null;

    const result = await withPageContentColumn(
        async () => {
            const [rows] = await pool.query(
                "INSERT INTO pages (book_id, title, content) VALUES (?, ? ,?)",
                [bookId, title, ""]
            );
            return { id: rows.insertId, bookId, title, content: "" };
        },
        async () => {
            const [rows] = await pool.query(
                "INSERT INTO pages (book_id, title) VALUES (?, ?)",
                [bookId, title]
            );
            return { id: rows.insertId, bookId, title };
        }
    );
    return result;
};

export const getPagesByBook = async (bookId, ownerId) => {
    const [rows] = await pool.query(
        `SELECT p.*
         FROM pages p
         JOIN books b ON b.id = p.book_id
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE p.book_id = ? AND w.owner_id = ?
         ORDER BY p.id ASC`,
        [bookId, ownerId]
    );
    return rows;
};

export const getPageById = async (id, ownerId) => {
    const [rows] = await pool.query(
        `SELECT p.*
         FROM pages p
         JOIN books b ON b.id = p.book_id
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE p.id = ? AND w.owner_id = ?`,
        [id, ownerId]
    );
    return rows[0];
};

export const updatePage = async (id, updates, ownerId) => {
    const { title, content } = updates;
    await withPageContentColumn(
        async () => {
            await pool.query(
                `UPDATE pages p
                 JOIN books b ON b.id = p.book_id
                 JOIN workspaces w ON w.id = b.workspace_id
                 SET p.title = ?, p.content = ?
                 WHERE p.id = ? AND w.owner_id = ?`,
                [title, content, id, ownerId]
            );
        },
        async () => {
            await pool.query(
                `UPDATE pages p
                 JOIN books b ON b.id = p.book_id
                 JOIN workspaces w ON w.id = b.workspace_id
                 SET p.title = ?
                 WHERE p.id = ? AND w.owner_id = ?`,
                [title, id, ownerId]
            );
        }
    );
    return getPageById(id, ownerId);
};

export const deletePage = async (id, ownerId) => {
    const [result] = await pool.query(
        `DELETE p FROM pages p
         JOIN books b ON b.id = p.book_id
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE p.id = ? AND w.owner_id = ?`,
        [id, ownerId]
    );
    return result.affectedRows;
};
