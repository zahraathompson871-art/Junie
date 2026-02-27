import {pool} from "../config/db.js";

const safeParse = (value) => {
    if (typeof value !== "string") return value || {};
    try {
        return JSON.parse(value);
    } catch {
        return {};
    }
};

const withBlockPositionColumn = async (onWithPosition, onWithoutPosition) => {
    try {
        return await onWithPosition();
    } catch (err) {
        if (err?.code === "ER_BAD_FIELD_ERROR" || String(err?.message || "").includes("Unknown column 'position'")) {
            return onWithoutPosition();
        }
        throw err;
    }
};

export const createBlock = async ({pageId, type, content, position = 0, ownerId}) => {
    const [pageRows] = await pool.query(
        `SELECT p.id
         FROM pages p
         JOIN books b ON b.id = p.book_id
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE p.id = ? AND w.owner_id = ?`,
        [pageId, ownerId]
    );
    if (!pageRows.length) return null;

    const result = await withBlockPositionColumn(
        async () => {
            const [rows] = await pool.query(
                "INSERT INTO blocks (page_id, type, content, position) VALUES (?, ?, ?, ?)",
                [pageId, type, JSON.stringify(content), position]
            );
            return rows;
        },
        async () => {
            const [rows] = await pool.query(
                "INSERT INTO blocks (page_id, type, content) VALUES (?, ?, ?)",
                [pageId, type, JSON.stringify(content)]
            );
            return rows;
        }
    );
    return { id: result.insertId, pageId, type, content, position };
};

export const getBlocksByPage = async (pageId, ownerId) => {
    const rows = await withBlockPositionColumn(
        async () => {
            const [r] = await pool.query(
                `SELECT bl.*
                 FROM blocks bl
                 JOIN pages p ON p.id = bl.page_id
                 JOIN books b ON b.id = p.book_id
                 JOIN workspaces w ON w.id = b.workspace_id
                 WHERE bl.page_id = ? AND w.owner_id = ?
                 ORDER BY bl.position ASC`,
                [pageId, ownerId]
            );
            return r;
        },
        async () => {
            const [r] = await pool.query(
                `SELECT bl.*
                 FROM blocks bl
                 JOIN pages p ON p.id = bl.page_id
                 JOIN books b ON b.id = p.book_id
                 JOIN workspaces w ON w.id = b.workspace_id
                 WHERE bl.page_id = ? AND w.owner_id = ?
                 ORDER BY bl.id ASC`,
                [pageId, ownerId]
            );
            return r;
        }
    );
    return rows.map(row => ({ ...row, content: safeParse(row.content) }));
};

export const getBlockById = async (id, ownerId) => {
    const [rows] = await pool.query(
        `SELECT bl.*
         FROM blocks bl
         JOIN pages p ON p.id = bl.page_id
         JOIN books b ON b.id = p.book_id
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE bl.id = ? AND w.owner_id = ?`,
        [id, ownerId]
    );
    const block = rows[0];
    if (!block) return null;
    return { ...block, content: safeParse(block.content) };
};

export const updateBlock = async (id, updates, ownerId) => {
    const { type, content, position } = updates;
    await withBlockPositionColumn(
        async () => {
            await pool.query(
                `UPDATE blocks bl
                 JOIN pages p ON p.id = bl.page_id
                 JOIN books b ON b.id = p.book_id
                 JOIN workspaces w ON w.id = b.workspace_id
                 SET bl.type = ?, bl.content = ?, bl.position = ?
                 WHERE bl.id = ? AND w.owner_id = ?`,
                [type, JSON.stringify(content), position, id, ownerId]
            );
        },
        async () => {
            await pool.query(
                `UPDATE blocks bl
                 JOIN pages p ON p.id = bl.page_id
                 JOIN books b ON b.id = p.book_id
                 JOIN workspaces w ON w.id = b.workspace_id
                 SET bl.type = ?, bl.content = ?
                 WHERE bl.id = ? AND w.owner_id = ?`,
                [type, JSON.stringify(content), id, ownerId]
            );
        }
    );
    return getBlockById(id, ownerId);
};

export const deleteBlock = async (id, ownerId) => {
    const [result] = await pool.query(
        `DELETE bl FROM blocks bl
         JOIN pages p ON p.id = bl.page_id
         JOIN books b ON b.id = p.book_id
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE bl.id = ? AND w.owner_id = ?`,
        [id, ownerId]
    );
    return result.affectedRows;
};
