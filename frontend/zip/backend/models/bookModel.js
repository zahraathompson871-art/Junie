import {pool} from "../config/db.js";

let notebookEntitlementsReady = false;
const FREE_NOTEBOOK_LIMIT = 1;

const ensureNotebookEntitlementsSchema = async () => {
    if (notebookEntitlementsReady) return;

    await pool.query(`
        CREATE TABLE IF NOT EXISTS notebook_entitlements (
            user_id BIGINT UNSIGNED NOT NULL,
            extra_slots INT UNSIGNED NOT NULL DEFAULT 0,
            is_unlimited TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id)
        )
    `);

    notebookEntitlementsReady = true;
};

const getOwnedNotebookCount = async (ownerId) => {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM books b
         JOIN workspaces w ON w.id = b.workspace_id
         WHERE w.owner_id = ?`,
        [ownerId]
    );
    return Number(rows?.[0]?.total || 0);
};

const getRawEntitlement = async (ownerId) => {
    await ensureNotebookEntitlementsSchema();
    const [rows] = await pool.query(
        "SELECT user_id, extra_slots, is_unlimited FROM notebook_entitlements WHERE user_id = ? LIMIT 1",
        [ownerId]
    );
    return rows[0] || null;
};

export const getNotebookEntitlement = async (ownerId) => {
    const raw = await getRawEntitlement(ownerId);
    const used = await getOwnedNotebookCount(ownerId);
    const extraSlots = Number(raw?.extra_slots || 0);
    const isUnlimited = Boolean(raw?.is_unlimited);
    const totalLimit = isUnlimited ? null : FREE_NOTEBOOK_LIMIT + extraSlots;
    const remaining = isUnlimited ? null : Math.max(0, totalLimit - used);

    return {
        used,
        baseLimit: FREE_NOTEBOOK_LIMIT,
        extraSlots,
        isUnlimited,
        totalLimit,
        remaining
    };
};

export const canCreateNotebook = async (ownerId) => {
    const entitlement = await getNotebookEntitlement(ownerId);
    if (entitlement.isUnlimited) {
        return { allowed: true, entitlement };
    }
    return {
        allowed: entitlement.used < entitlement.totalLimit,
        entitlement
    };
};

export const purchaseNotebookSlots = async (ownerId, quantity = 1) => {
    await ensureNotebookEntitlementsSchema();
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error("Invalid slot quantity");
    }

    await pool.query(
        `INSERT INTO notebook_entitlements (user_id, extra_slots, is_unlimited)
         VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE extra_slots = extra_slots + VALUES(extra_slots)`,
        [ownerId, qty]
    );

    return getNotebookEntitlement(ownerId);
};

export const unlockNotebookUnlimited = async (ownerId) => {
    await ensureNotebookEntitlementsSchema();
    await pool.query(
        `INSERT INTO notebook_entitlements (user_id, extra_slots, is_unlimited)
         VALUES (?, 0, 1)
         ON DUPLICATE KEY UPDATE is_unlimited = 1`,
        [ownerId]
    );
    return getNotebookEntitlement(ownerId);
};

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
