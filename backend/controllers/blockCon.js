import * as Block from '../models/Block.js';

export const createBlock = async (req, res) => {
    try {
        const { pageId, type, content, position } = req.body;
        const block = await Block.createBlock({ pageId, type, content, position });
        res.status(201).json(block);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const getBlocks = async (req, res) => {
    try {
        const blocks = await Block.getBlocksByPage(req.params.pageId);
        res.json(blocks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const getBlock = async (req, res) => {
    try {
        const block = await Block.getBlockById(req.params.id);
        if (!block) return res.status(404).json({ error: "Block not found" });
        res.json(block);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const updateBlock = async (req, res) => {
    try {
        const block = await Block.updateBlock(req.params.id, req.body);
        res.json(block);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const deleteBlock = async (req, res) => {
    try {
        const rows = await Block.deleteBlock(req.params.id);
        if (!rows) return res.status(404).json({ error: "Block not found" });
        res.json({ message: "Block deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};