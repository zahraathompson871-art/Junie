import {pool} from "../config/db.js";

export const createWorkspace = async ({name, ownerId, plan = "free"}) => {
  const [result] = await pool.query(
    "INSERT INTO workspaces (name, owner_id, plan) VALUES (?, ?, ?)",
    [name, ownerId, plan]
  );
  return { id: result.insertId, name, ownerId, plan };
};

export const getWorkspaceByOwnerId = async (ownerId) => {
  const [rows] = await pool.query(
    "SELECT * FROM workspaces WHERE owner_id = ? ORDER BY id ASC",
    [ownerId]
  );
  return rows;
};

export const updateWorkspace = async (id, updates) => {
  const { name, plan } = updates;
  await db.query(
    "UPDATE workspaces SET name = ?, plan = ? WHERE id = ?",
    [name, plan, id]
  );
    const [rows] = await pool.query(
      "SELECT * FROM workspaces WHERE id = ?",
      [id]
    );
    return rows[0];
};

export const deleteWorkspace = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM workspaces WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};