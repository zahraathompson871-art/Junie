import * as Page from '../models/Page.js';

export const createPage = async (req, res) => {
    try {
        const { bookId, title } = req.body;
        const page = await Page.createPage({ bookId, title });
        res.status(201).json(page);
    } catch (err) {        
        res.status(500).json({ error: err.message });
    }
};

export const getPages = async (req, res) => {
    try {
        const pages = await Page.getPagesByBook(req.params.bookId);
        if (!pages) return res.status(404).json({ error: "Pages not found" });
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const getPage = async (req, res) => {
    try {
        const page = await Page.getPageById(req.params.id);
        if (!page) return res.status(404).json({ error: "Page not found" });
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }     
};

export const updatePage = async (req, res) => {
    try {
        const page = await Page.updatePage(req.params.id, req.body);
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const deletePage = async (req, res) => {
    try {
        const rows = await Page.deletePage(req.params.id);
        if (!rows) return res.status(404).json({ error: "Page not found" });
        res.json({ message: "Page deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};