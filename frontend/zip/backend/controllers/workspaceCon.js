import * as Workspace from "../models/workspaceModel.js";

export const createWorkspace = async (req, res) => {
  try {
    const { name, plan } = req.body;
    const workspace = await Workspace.createWorkspace({name, ownerId: req.user.id, plan});
    res.status(201).json(workspace );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.getWorkspaceByOwnerId(req.user.id);
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.getWorkspaceById(req.params.id, req.user.id);
        if (!workspace) return res.status(404).json({ error: "Workspace not found" });
        res.json(workspace);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
};

export const updateWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.updateWorkspace(req.params.id, req.body, req.user.id);
        if (!workspace) return res.status(404).json({ error: "Workspace not found" });
        res.json(workspace);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
};

export const deleteWorkspace = async (req, res) => {
    try {
        const rows = await Workspace.deleteWorkspace(req.params.id, req.user.id);
        if (!rows) return res.status(404).json({ error: "Workspace not found" });
        res.json({ message: "Workspace deleted" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }  
};
