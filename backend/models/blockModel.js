import {pool} from "../config/db.js";

export const createBlock = async ({pageId, type, content, position = 0}) => {
    const [result] = await pool.query(
        "INSERT INTO blocks (page_id, type, content, position) VALUES (?, ?, ?, ?)",
        [pageId, type, JSON.stringify(content), position]
    );
    return { id: result.insertId, pageId, type, content, position };
};

export const getBlocksByPage = async (pageId) => {
    const [rows] = await pool.query(
        "SELECT * FROM blocks WHERE page_id = ? ORDER BY position ASC",
        [pageId]
    );
    return rows.map(row => ({ ...block, content: JSON.parse(block.content) }));
};

export const getBlockById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM blocks WHERE id = ?",
        [id]
    );
    const block = rows[0];
    if (!block) return null;
    return { ...block, content: JSON.parse(block.content) };
};

export const updateBlock = async (id, updates) => {
    const { type, content, position } = updates;
    await pool.query(
        "UPDATE blocks SET type = ?, content = ?, position = ? WHERE id = ?",
        [type, JSON.stringify(content), position, id]
    );
    return getBlockById(id);
};

export const deleteBlock = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM blocks WHERE id = ?",
        [id]
    );
    return result.affectedRows;
};