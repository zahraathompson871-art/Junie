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

export const getWorkspaceById = async (id, ownerId) => {
  const [rows] = await pool.query(
    "SELECT * FROM workspaces WHERE id = ? AND owner_id = ?",
    [id, ownerId]
  );
  return rows[0];
};

export const updateWorkspace = async (id, updates, ownerId) => {
  const { name, plan } = updates;
  await pool.query(
    "UPDATE workspaces SET name = ?, plan = ? WHERE id = ? AND owner_id = ?",
    [name, plan, id, ownerId]
  );
  const [rows] = await pool.query(
    "SELECT * FROM workspaces WHERE id = ? AND owner_id = ?",
    [id, ownerId]
  );
  return rows[0];
};

export const deleteWorkspace = async (id, ownerId) => {
  const [result] = await pool.query(
    "DELETE FROM workspaces WHERE id = ? AND owner_id = ?",
    [id, ownerId]
  );
  return result.affectedRows;
};
