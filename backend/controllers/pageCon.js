import * as Page from '../models/pageModel.js';

export const createPage = async (req, res) => {
    try {
        const { bookId, title } = req.body;
        const page = await Page.createPage(bookId, title, req.user.id);
        if (!page) return res.status(404).json({ error: "Book not found" });
        res.status(201).json(page);
    } catch (err) {        
        res.status(500).json({ error: err.message });
    }
};

export const getPages = async (req, res) => {
    try {
        const pages = await Page.getPagesByBook(req.params.bookId, req.user.id);
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const getPage = async (req, res) => {
    try {
        const page = await Page.getPageById(req.params.id, req.user.id);
        if (!page) return res.status(404).json({ error: "Page not found" });
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }     
};

export const updatePage = async (req, res) => {
    try {
        const page = await Page.updatePage(req.params.id, req.body, req.user.id);
        if (!page) return res.status(404).json({ error: "Page not found" });
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const deletePage = async (req, res) => {
    try {
        const rows = await Page.deletePage(req.params.id, req.user.id);
        if (!rows) return res.status(404).json({ error: "Page not found" });
        res.json({ message: "Page deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};
